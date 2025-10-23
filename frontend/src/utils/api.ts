import axios from 'axios';
import toast from 'react-hot-toast';
// import { logger } from './logger';
import { validateData, validationSchemas } from './validation';
import { 
  AuthResponse, 
  ProductsResponseLegacy,
  Product, 
  Order, 
  SearchFilters, 
  HealthResponse 
} from '../types';
// import { someUnusedUtil } from './utils';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API configuration loaded

// Create axios instance with custom config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// const api_v2 = axios.create({ baseURL: API_BASE_URL + '/v2' });

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls in dev
    if (import.meta.env.DEV) {
      // API request interceptor
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);


// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful calls in dev
    if (import.meta.env.DEV) {
      // API response interceptor
    }
    
    return response;
  },
  (error) => {
    // Log API errors
    console.error(`API Error: ${error.config?.method} ${error.config?.url}`, error);

    // Handle different error types
    if (error.response && error.response.status === 401) {
      // Only redirect if not on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (error.response && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response && error.response.status >= 400) {
      const errorData = error.response.data;
      const message = errorData?.message || 'Something went wrong.';
      
      // Don't show toast for login/register errors
      if (!error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/register')) {
        toast.error(message);
      }
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Helper functions removed - now handling responses directly in each API function

// Auth API - with better error handling and validation
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    // Login attempt
    
    // Validate input
    const validation = validateData(validationSchemas.login, { username, password });
    if (!validation.success) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const response = await api.post<any>('/auth/login', { 
        username, 
        password 
      });
      
      // Handle both response formats
      if (response.data.token && response.data.user) {
        // Direct format: {message, token, user}
        return {
          success: true,
          message: response.data.message || 'Login successful',
          data: {
            user: response.data.user,
            token: response.data.token
          },
          timestamp: new Date().toISOString()
        };
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {user, token}}
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
          timestamp: response.data.timestamp
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      // Login failed
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (username: string, password: string, email?: string): Promise<AuthResponse> => {
    // Registration attempt
    
    // Validate input
    const validation = validateData(validationSchemas.register, { username, password, email });
    if (!validation.success) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const response = await api.post<any>('/auth/register', { 
        username, 
        password, 
        email 
      });
      
      // Handle both response formats
      if (response.data.token && response.data.user) {
        // Direct format: {message, token, user}
        return {
          success: true,
          message: response.data.message || 'Registration successful',
          data: {
            user: response.data.user,
            token: response.data.token
          },
          timestamp: new Date().toISOString()
        };
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {user, token}}
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
          timestamp: response.data.timestamp
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      // Registration failed
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  getCurrentUser: async () => {
    // Getting current user
    
    try {
      const response = await api.get<any>('/auth/me');
      
      // Handle both response formats
      if (response.data.user) {
        // Direct format: {user: {...}}
        return response.data.user;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {user: {...}}}
        return response.data.data.user || response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      // Get current user failed
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  },

  logout: async () => {
    // Logout attempt
    
    try {
      await api.post('/auth/logout');
      // Logout successful
    } catch (error: any) {
      // Don't throw error for logout - it's not critical
      console.warn('Logout API call failed:', error.message);
    }
  }
};

// Products API - with better error handling and validation
export const productsAPI = {
  getProducts: async (filters: SearchFilters = {}): Promise<ProductsResponseLegacy> => {
    // Validate filters
    const validation = validateData(validationSchemas.searchFilters, filters);
    if (!validation.success) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const url = `/products?${params.toString()}`;
      const response = await api.get<any>(url);
      
      // Handle the actual response format from the API
      if (response.data.products && response.data.pagination) {
        // Direct format: {products: [...], pagination: {...}}
        return {
          products: response.data.products || [],
          pagination: response.data.pagination
        };
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: [...], pagination: {...}}
        return {
          products: response.data.data || [],
          pagination: response.data.pagination!
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch products:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  getProduct: async (id: string): Promise<Product> => {
    // Fetching product
    
    try {
      const response = await api.get<any>(`/products/${id}`);
      
      // Handle both response formats
      if (response.data._id || response.data.id) {
        // Direct format: {_id, name, price, ...}
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {_id, name, price, ...}}
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error(`Failed to fetch product: ${id}:`, error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  createProduct: async (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    // Creating product
    
    // Validate product data
    const validation = validateData(validationSchemas.createProduct, product);
    if (!validation.success) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const response = await api.post<any>('/products', product);
      console.log('🔍 Create Product Response:', response.data);
      
      // Handle multiple response formats
      if (response.data._id || response.data.id) {
        // Direct format: {_id, name, price, ...}
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {_id, name, price, ...}} or {success: true, data: {product: {...}}}
        return response.data.data.product || response.data.data;
      } else if (response.data.product) {
        // Alternative format: {product: {_id, name, price, ...}}
        return response.data.product;
      } else {
        console.error('❌ Unexpected response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error(`Failed to create product: ${product.name}:`, error.message);
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    // Updating product
    
    // Validate product data
    const validation = validateData(validationSchemas.updateProduct, product);
    if (!validation.success) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const response = await api.put<any>(`/products/${id}`, product);
      console.log('🔍 Update Product Response:', response.data);
      
      // Handle multiple response formats
      if (response.data._id || response.data.id) {
        // Direct format: {_id, name, price, ...}
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {_id, name, price, ...}} or {success: true, data: {product: {...}}}
        return response.data.data.product || response.data.data;
      } else if (response.data.product) {
        // Alternative format: {product: {_id, name, price, ...}}
        return response.data.product;
      } else {
        console.error('❌ Unexpected response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error(`Failed to update product: ${id}:`, error.message);
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    // Deleting product
    
    try {
      await api.delete(`/products/${id}`);
      // Product deleted
    } catch (error: any) {
      console.error(`Failed to delete product: ${id}:`, error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const url = '/products/categories/list';
      const response = await api.get<any>(url);
      
      // Handle the actual response format from the API
      if (response.data.categories) {
        // Direct format: {categories: [...]}
        return response.data.categories || [];
      } else if (response.data.success && response.data.data?.categories) {
        // Wrapped format: {success: true, data: {categories: [...]}}
        return response.data.data.categories || [];
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    // Fetching low stock products
    
    try {
      const response = await api.get<any>(`/products/admin/low-stock?threshold=${threshold}`);
      
      // Handle both response formats
      if (Array.isArray(response.data)) {
        // Direct format: [{_id, name, price, ...}, ...]
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: [{_id, name, price, ...}, ...]}
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch low stock products:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch low stock products');
    }
  }
};

// Orders API - with better error handling and validation
export const ordersAPI = {
  createOrder: async (items: { productId: string; quantity: number }[], shippingAddress: any): Promise<Order> => {
    // Creating order
    
    // Validate order data
    const validation = validateData(validationSchemas.createOrder, { items, shippingAddress });
    if (!validation.success) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const response = await api.post<any>('/orders', { items, shippingAddress });
      console.log('🔍 Create Order Response:', response.data);
      
      // Handle multiple response formats
      if (response.data._id || response.data.id) {
        // Direct format: {_id, items, totalAmount, ...}
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {_id, items, totalAmount, ...}}
        return response.data.data;
      } else if (response.data.order) {
        // Alternative format: {order: {_id, items, totalAmount, ...}}
        return response.data.order;
      } else {
        console.error('❌ Unexpected response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to create order:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  getOrders: async (): Promise<Order[]> => {
    // Fetching orders
    
    try {
      const response = await api.get<any>('/orders');
      
      // Handle both response formats
      if (Array.isArray(response.data)) {
        // Direct format: [{_id, items, totalAmount, ...}, ...]
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: [{_id, items, totalAmount, ...}, ...]}
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  getOrder: async (id: string): Promise<Order> => {
    // Fetching order
    
    try {
      const response = await api.get<any>(`/orders/${id}`);
      
      // Handle both response formats
      if (response.data._id || response.data.id) {
        // Direct format: {_id, items, totalAmount, ...}
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {_id, items, totalAmount, ...}}
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error(`Failed to fetch order: ${id}:`, error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    // Updating order status
    
    try {
      const response = await api.patch<any>(`/orders/${id}/status`, { status });
      
      // Handle both response formats
      if (response.data._id || response.data.id) {
        // Direct format: {_id, items, totalAmount, ...}
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Wrapped format: {success: true, data: {_id, items, totalAmount, ...}}
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error(`Failed to update order status: ${id}:`, error.message);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }
};

// Health check API
export const healthAPI = {
  check: async (): Promise<HealthResponse> => {
    // Checking API health
    
    try {
      const response = await api.get<HealthResponse>('/health');
      // API health check successful
      return response.data;
    } catch (error: any) {
      console.error('API health check failed:', error.message);
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  }
};

export default api;