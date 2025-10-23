import express, { Request, Response } from 'express';
import Product from '../models/Product';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { ApiResponse, logger } from '../utils/responseHandler';
import { validate, validateQuery, validationSchemas } from '../utils/validation';

const router: express.Router = express.Router();
const default_limit = 12;
const cache_ttl = 300;

router.get('/', validateQuery(validationSchemas.productQuery), async (req: Request, res: Response) => {
  try {
    const { search, category, minPrice, maxPrice, page, limit } = req.query;
    
    logger.info(`Products query: search="${search}", category="${category}", page=${page}`);

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    filter.stock = { $gt: 0 };

    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Product.countDocuments(filter);

    // Calculate pagination info
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const totalPages = Math.ceil(total / limitNum);
    
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    };

    logger.debug(`Found ${products.length} products out of ${total} total`);

    return ApiResponse.paginated(res, products, pagination, 
      products.length > 0 ? 'Products retrieved successfully' : 'No products found matching your criteria');

  } catch (error: any) {
    logger.error('Get products error:', error);
    return ApiResponse.error(res, 'Failed to fetch products', 500, error);
  }
});

// Get single product - with some business logic
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    logger.debug(`Fetching product: ${id}`);

    const product = await Product.findById(id);
    
    if (!product) {
      logger.warn(`Product not found: ${id}`);
      return ApiResponse.notFound(res, 'Product');
    }

    // Add some business logic - check if product is available
    if (product.stock === 0) {
      logger.info(`Product out of stock: ${product.name}`);
      // Still return the product but with a note
      return ApiResponse.success(res, {
        ...product.toObject(),
        availability: 'out_of_stock',
        message: 'This product is currently out of stock'
      }, 'Product retrieved (currently out of stock)');
    }

    return ApiResponse.success(res, product, 'Product retrieved successfully');

  } catch (error: any) {
    logger.error('Get product error:', error);
    return ApiResponse.error(res, 'Failed to fetch product', 500, error);
  }
});

// Create product (admin only) - with some validation
router.post('/', authenticateToken, requireAdmin, validate(validationSchemas.createProduct), async (req: AuthRequest, res: Response) => {
  try {
    const productData = req.body;
    
    logger.info(`Creating product: ${productData.name} by ${req.user.role}: ${req.user.username}`);

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${productData.name}$`, 'i') } 
    });
    
    if (existingProduct) {
      logger.warn(`Product creation failed - duplicate name: ${productData.name}`);
      return ApiResponse.error(res, 'A product with this name already exists', 409);
    }

    const product = new Product(productData);
    await product.save();

    logger.info(`Product created successfully: ${product.name} (ID: ${product._id})`);

    return ApiResponse.created(res, product, `Product "${product.name}" created successfully! 🎉`);

  } catch (error: any) {
    logger.error('Create product error:', error);
    return ApiResponse.error(res, 'Failed to create product', 500, error);
  }
});

// Update product (admin only) - with some business logic
router.put('/:id', authenticateToken, requireAdmin, validate(validationSchemas.updateProduct), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    logger.info(`Updating product: ${id} by ${req.user.role}: ${req.user.username}`);

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      logger.warn(`Product update failed - not found: ${id}`);
      return ApiResponse.notFound(res, 'Product');
    }

    // If updating name, check for duplicates
    if (updateData.name && updateData.name !== existingProduct.name) {
      const duplicateProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (duplicateProduct) {
        logger.warn(`Product update failed - duplicate name: ${updateData.name}`);
        return ApiResponse.error(res, 'A product with this name already exists', 409);
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`Product updated successfully: ${product?.name}`);

    return ApiResponse.success(res, product, `Product "${product?.name}" updated successfully! ✨`);

  } catch (error: any) {
    logger.error('Update product error:', error);
    return ApiResponse.error(res, 'Failed to update product', 500, error);
  }
});

// Delete product (admin only) - with safety checks
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    logger.info(`Deleting product: ${id} by ${req.user.role}: ${req.user.username}`);

    const product = await Product.findById(id);
    if (!product) {
      logger.warn(`Product deletion failed - not found: ${id}`);
      return ApiResponse.notFound(res, 'Product');
    }

    // Check if product has been ordered (basic business logic)
    // In a real app, you'd check the orders collection
    if (product.stock > 0) {
      logger.warn(`Product deletion warning - product has stock: ${product.name}`);
      // Still allow deletion but log it
    }

    await Product.findByIdAndDelete(id);

    logger.info(`Product deleted successfully: ${product.name}`);

    return ApiResponse.success(res, null, `Product "${product.name}" deleted successfully`);

  } catch (error: any) {
    logger.error('Delete product error:', error);
    return ApiResponse.error(res, 'Failed to delete product', 500, error);
  }
});

// Get categories - with some caching logic
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    logger.debug('Fetching product categories');

    const categories = await Product.distinct('category');
    
    // Sort categories alphabetically for better UX
    const sortedCategories = categories.sort((a, b) => a.localeCompare(b));

    logger.debug(`Found ${sortedCategories.length} categories`);

    return ApiResponse.success(res, { categories: sortedCategories }, 'Categories retrieved successfully');

  } catch (error: any) {
    logger.error('Get categories error:', error);
    return ApiResponse.error(res, 'Failed to fetch categories', 500, error);
  }
});

// Get low stock products (admin only) - useful business endpoint
router.get('/admin/low-stock', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    
    logger.info(`Fetching low stock products (threshold: ${threshold}) by ${req.user.role}: ${req.user.username}`);

    const lowStockProducts = await Product.find({ 
      stock: { $lte: threshold, $gt: 0 } 
    }).sort({ stock: 1 });

    return ApiResponse.success(res, lowStockProducts, 
      `Found ${lowStockProducts.length} products with low stock`);

  } catch (error: any) {
    logger.error('Get low stock products error:', error);
    return ApiResponse.error(res, 'Failed to fetch low stock products', 500, error);
  }
});

export default router;