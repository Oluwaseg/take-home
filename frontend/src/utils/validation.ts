import { z } from 'zod';
// import { someValidationUtil } from './validation-helpers';

// Validation schemas
export const validationSchemas = {
  // User validation
  login: z.object({
    username: z.string()
      .min(1, 'Username is required')
      .max(30, 'Username must be less than 30 characters')
      .trim(),
    password: z.string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
  }),

  register: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be less than 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .trim(),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  }),

  // Product validation
  createProduct: z.object({
    name: z.string()
      .min(1, 'Product name is required')
      .max(100, 'Product name must be less than 100 characters')
      .trim(),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters')
      .trim(),
    price: z.number()
      .positive('Price must be a positive number')
      .max(999999, 'Price seems too high'),
    category: z.string()
      .min(1, 'Category is required')
      .max(50, 'Category must be less than 50 characters')
      .trim(),
    stock: z.number()
      .int('Stock must be a whole number')
      .min(0, 'Stock cannot be negative')
      .max(9999, 'Stock seems too high'),
    imageUrl: z.string()
      .url('Image URL must be a valid URL')
      .optional()
      .or(z.literal(''))
  }),

  updateProduct: z.object({
    name: z.string()
      .min(1, 'Product name cannot be empty')
      .max(100, 'Product name must be less than 100 characters')
      .trim()
      .optional(),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters')
      .trim()
      .optional(),
    price: z.number()
      .positive('Price must be a positive number')
      .max(999999, 'Price seems too high')
      .optional(),
    category: z.string()
      .min(1, 'Category cannot be empty')
      .max(50, 'Category must be less than 50 characters')
      .trim()
      .optional(),
    stock: z.number()
      .int('Stock must be a whole number')
      .min(0, 'Stock cannot be negative')
      .max(9999, 'Stock seems too high')
      .optional(),
    imageUrl: z.string()
      .url('Image URL must be a valid URL')
      .optional()
      .or(z.literal(''))
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  }),

  // Order validation
  createOrder: z.object({
    items: z.array(z.object({
      productId: z.string()
        .min(1, 'Product ID is required')
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
      quantity: z.number()
        .int('Quantity must be a whole number')
        .min(1, 'Quantity must be at least 1')
        .max(100, 'Quantity cannot exceed 100')
    }))
    .min(1, 'At least one item is required')
    .max(20, 'Cannot order more than 20 different items'),
    shippingAddress: z.object({
      street: z.string()
        .min(1, 'Street address is required')
        .max(100, 'Street address must be less than 100 characters')
        .trim(),
      city: z.string()
        .min(1, 'City is required')
        .max(50, 'City must be less than 50 characters')
        .trim(),
      state: z.string()
        .min(1, 'State is required')
        .max(50, 'State must be less than 50 characters')
        .trim(),
      zipCode: z.string()
        .min(1, 'Zip code is required')
        .max(10, 'Zip code must be less than 10 characters')
        .trim(),
      country: z.string()
        .min(1, 'Country is required')
        .max(50, 'Country must be less than 50 characters')
        .trim()
    })
  }),

  // Search filters validation
  searchFilters: z.object({
    search: z.string().max(100, 'Search term too long').optional(),
    category: z.string().max(50, 'Category too long').optional(),
    minPrice: z.number().positive('Min price must be positive').optional(),
    maxPrice: z.number().positive('Max price must be positive').optional(),
    page: z.number().int().min(1, 'Page must be at least 1').optional(),
    limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional()
  })
};

// Validation helper functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: any) => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
        return `${path}${err.message}`;
      });
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Safe validation that doesn't throw
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown): T | null => {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
};

// Form validation helper
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = validateData(schema, data);
  if (!result.success) {
    // Log validation errors for debugging
    console.warn('Form validation failed:', result.errors);
  }
  return result;
};

// const userProfileSchema = z.object({ ... });
// const reviewSchema = z.object({ ... });
