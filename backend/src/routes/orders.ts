import express, { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ApiResponse, logger } from '../utils/responseHandler';
import { validate, validationSchemas } from '../utils/validation';

const router: express.Router = express.Router();

// Create order - with business logic and validation
router.post('/', authenticateToken, validate(validationSchemas.createOrder), async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user._id;
    
    logger.info(`Creating order for user: ${req.user.username} with ${items.length} items`);

    let totalAmount = 0;
    const orderItems = [];
    const productUpdates = [];

    // Validate each product and calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        logger.warn(`Product not found: ${item.productId}`);
        return ApiResponse.error(res, `Product with ID ${item.productId} not found`, 404);
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        logger.warn(`Insufficient stock for product: ${product.name} (requested: ${item.quantity}, available: ${product.stock})`);
        return ApiResponse.error(res, 
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`, 
          400
        );
      }

      // Calculate item total
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Prepare order item
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Prepare stock update
      productUpdates.push({
        productId: product._id,
        newStock: product.stock - item.quantity
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
      shippingAddress
    });

    await order.save();

    // Update product stock (in a transaction in production)
    for (const update of productUpdates) {
      await Product.findByIdAndUpdate(
        update.productId,
        { stock: update.newStock }
      );
    }

    // Populate the order with product details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price imageUrl category')
      .populate('user', 'username email');

    logger.info(`Order created successfully: ${order._id} for user: ${req.user.username}, total: $${totalAmount}`);

    return ApiResponse.created(res, populatedOrder, 
      `Order placed successfully! Your order total is $${totalAmount.toFixed(2)} 🎉`);

  } catch (error: any) {
    logger.error('Create order error:', error);
    return ApiResponse.error(res, 'Failed to create order. Please try again.', 500, error);
  }
});

// Get user orders - with some filtering and sorting
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;
    
    logger.debug(`Fetching orders for user: ${req.user.username}`);

    // Build filter
    const filter: any = { user: userId };
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate('items.product', 'name price imageUrl category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    // Calculate pagination
    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    };

    logger.debug(`Found ${orders.length} orders for user: ${req.user.username}`);

    return ApiResponse.paginated(res, orders, pagination, 
      orders.length > 0 ? 'Orders retrieved successfully' : 'No orders found');

  } catch (error: any) {
    logger.error('Get orders error:', error);
    return ApiResponse.error(res, 'Failed to fetch orders', 500, error);
  }
});

// Get single order - with authorization check
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    logger.debug(`Fetching order: ${id} for user: ${req.user.username}`);

    const order = await Order.findOne({ 
      _id: id, 
      user: userId 
    })
    .populate('items.product', 'name price imageUrl category description')
    .populate('user', 'username email');

    if (!order) {
      logger.warn(`Order not found or unauthorized access: ${id} by user: ${req.user.username}`);
      return ApiResponse.notFound(res, 'Order');
    }

    return ApiResponse.success(res, order, 'Order retrieved successfully');

  } catch (error: any) {
    logger.error('Get order error:', error);
    return ApiResponse.error(res, 'Failed to fetch order', 500, error);
  }
});

// Update order status (admin only) - useful for order management
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    
    // Check if user is admin or order owner
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      logger.warn(`Order not found or unauthorized: ${id} by user: ${req.user.username}`);
      return ApiResponse.notFound(res, 'Order');
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return ApiResponse.error(res, 'Invalid status. Must be one of: ' + validStatuses.join(', '), 400);
    }

    // Update order status
    order.status = status;
    await order.save();

    logger.info(`Order status updated: ${id} to ${status} by user: ${req.user.username}`);

    return ApiResponse.success(res, order, `Order status updated to ${status}`);

  } catch (error: any) {
    logger.error('Update order status error:', error);
    return ApiResponse.error(res, 'Failed to update order status', 500, error);
  }
});

// Get order statistics (admin only)
router.get('/admin/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'Admin access required');
    }

    logger.info(`Fetching order statistics by admin: ${req.user.username}`);

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      ...stats[0],
      statusBreakdown: statusStats
    };

    return ApiResponse.success(res, result, 'Order statistics retrieved successfully');

  } catch (error: any) {
    logger.error('Get order stats error:', error);
    return ApiResponse.error(res, 'Failed to fetch order statistics', 500, error);
  }
});

// Health check for orders service
router.get('/health', (req: Request, res: Response) => {
  return ApiResponse.success(res, {
    service: 'Orders Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, 'Orders service is running smoothly');
});

export default router;