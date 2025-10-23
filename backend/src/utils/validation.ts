import Joi from 'joi';
// import { someValidationUtil } from './helpers';

export const validationSchemas = {
  // User validation
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      })
  }),

  login: Joi.object({
    username: Joi.string().required().messages({
      'any.required': 'Username is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Product validation
  createProduct: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Product name cannot be empty',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
      }),
    description: Joi.string()
      .trim()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Product description is required'
      }),
    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.positive': 'Price must be a positive number',
        'any.required': 'Price is required'
      }),
    category: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Category cannot be empty',
        'string.max': 'Category cannot exceed 50 characters',
        'any.required': 'Category is required'
      }),
    stock: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.integer': 'Stock must be a whole number',
        'number.min': 'Stock cannot be negative',
        'any.required': 'Stock is required'
      }),
    imageUrl: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Image URL must be a valid URL'
      })
  }),

  updateProduct: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().min(10).max(500).optional(),
    price: Joi.number().positive().precision(2).optional(),
    category: Joi.string().trim().min(1).max(50).optional(),
    stock: Joi.number().integer().min(0).optional(),
    imageUrl: Joi.string().uri().optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // Order validation
  createOrder: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
            'string.pattern.base': 'Invalid product ID format',
            'any.required': 'Product ID is required'
          }),
          quantity: Joi.number().integer().min(1).max(100).required().messages({
            'number.integer': 'Quantity must be a whole number',
            'number.min': 'Quantity must be at least 1',
            'number.max': 'Quantity cannot exceed 100',
            'any.required': 'Quantity is required'
          })
        })
      )
      .min(1)
      .max(20)
      .required()
      .messages({
        'array.min': 'At least one item is required',
        'array.max': 'Cannot order more than 20 different items',
        'any.required': 'Order items are required'
      }),
    shippingAddress: Joi.object({
      street: Joi.string().trim().min(3).max(100).required().messages({
        'string.min': 'Street address must be at least 3 characters',
        'string.max': 'Street address cannot exceed 100 characters',
        'any.required': 'Street address is required'
      }),
      city: Joi.string().trim().min(1).max(50).required().messages({
        'string.min': 'City name is required',
        'string.max': 'City name cannot exceed 50 characters',
        'any.required': 'City is required'
      }),
      state: Joi.string().trim().min(1).max(50).required().messages({
        'string.min': 'State is required',
        'string.max': 'State cannot exceed 50 characters',
        'any.required': 'State is required'
      }),
      zipCode: Joi.string().trim().min(3).max(10).required().messages({
        'string.min': 'Zip code must be at least 3 characters',
        'string.max': 'Zip code cannot exceed 10 characters',
        'any.required': 'Zip code is required'
      }),
      country: Joi.string().trim().min(1).max(50).required().messages({
        'string.min': 'Country is required',
        'string.max': 'Country cannot exceed 50 characters',
        'any.required': 'Country is required'
      })
    }).required().messages({
      'any.required': 'Shipping address is required'
    })
  }),

  // Query parameters validation
  productQuery: Joi.object({
    search: Joi.string().trim().max(100).optional(),
    category: Joi.string().trim().max(50).optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

// Custom validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    req.query = value;
    next();
  };
};
