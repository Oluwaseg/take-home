import axios, { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
// import { logger } from './logger';
import { validateData, validationSchemas } from './validation';
import { 
  AuthResponse, 
  ProductsResponseLegacy,
  Product, 
  Order, 
  SearchFilters, 
  ApiResponse,
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

// Helper function to handle API responses
const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data as T;
  }
  throw new Error(response.data.message || 'API request failed');
};

// Helper function for auth responses (they have a different structure)
const handleAuthResponse = (response: AxiosResponse<ApiResponse<{ user: any; token: string }>>): AuthResponse => {
  if (response.data.success && response.data.data) {
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
      timestamp: response.data.timestamp
    };
  }
  throw new Error(response.data.message || 'API request failed');
};

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
      const response = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', { 
        username, 
        password 
      });
      
      const authResponse = handleAuthResponse(response);
      // Login successful
      
      return authResponse;
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
      const response = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/register', { 
        username, 
        password, 
        email 
      });
      
      const authResponse = handleAuthResponse(response);
      // Registration successful
      
      return authResponse;
    } catch (error: any) {
      // Registration failed
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  getCurrentUser: async () => {
    // Getting current user
    
    try {
      const response = await api.get<ApiResponse<{ user: any }>>('/auth/me');
      const userData = handleApiResponse(response);
      // Current user retrieved
      return userData;
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
    // Fetching products
    
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
      
      const response = await api.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);
      const products = handleApiResponse(response);
      
      // Products retrieved
      
      // Return in legacy format for backward compatibility
      return {
        products: products,
        pagination: response.data.pagination!
      };
    } catch (error: any) {
      console.error('Failed to fetch products:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  getProduct: async (id: string): Promise<Product> => {
    // Fetching product
    
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      const product = handleApiResponse(response);
      
      // Product retrieved
      return product;
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
      const response = await api.post<ApiResponse<{ product: Product }>>('/products', product);
      const data = handleApiResponse(response);
      const createdProduct = data.product;
      
      // Product created
      return createdProduct;
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
      const response = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, product);
      const data = handleApiResponse(response);
      const updatedProduct = data.product;
      
      // Product updated
      return updatedProduct;
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
    // Fetching categories
    
    try {
      const response = await api.get<ApiResponse<{ categories: string[] }>>('/products/categories/list');
      const data = handleApiResponse(response);
      
      // Categories retrieved
      return data.categories;
    } catch (error: any) {
      console.error('Failed to fetch categories:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    // Fetching low stock products
    
    try {
      const response = await api.get<ApiResponse<Product[]>>(`/products/admin/low-stock?threshold=${threshold}`);
      const products = handleApiResponse(response);
      
      // Low stock products retrieved
      return products;
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
      const response = await api.post<ApiResponse<Order>>('/orders', { items, shippingAddress });
      const order = handleApiResponse(response);
      
      // Order created
      return order;
    } catch (error: any) {
      console.error('Failed to create order:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  getOrders: async (): Promise<Order[]> => {
    // Fetching orders
    
    try {
      const response = await api.get<ApiResponse<Order[]>>('/orders');
      const orders = handleApiResponse(response);
      
      // Orders retrieved
      return orders;
    } catch (error: any) {
      console.error('Failed to fetch orders:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  getOrder: async (id: string): Promise<Order> => {
    // Fetching order
    
    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      const order = handleApiResponse(response);
      
      // Order retrieved
      return order;
    } catch (error: any) {
      console.error(`Failed to fetch order: ${id}:`, error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    // Updating order status
    
    try {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
      const order = handleApiResponse(response);
      
      // Order status updated
      return order;
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