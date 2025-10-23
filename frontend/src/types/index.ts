// Updated types to match backend response format
export interface User {
  _id: string; // Changed from id to _id to match backend
  username: string;
  email?: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  // Additional fields that might come from backend
  availability?: 'in_stock' | 'out_of_stock' | 'low_stock';
  message?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  totalAmount: number; // Changed from total to totalAmount to match backend
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Updated to match backend response format
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
  timestamp: string;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  timestamp: string;
}

// For backward compatibility with existing code
export interface ProductsResponseLegacy {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface SearchFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: string[];
  };
  timestamp: string;
}

// API Error response format
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}

// Generic API response format
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  timestamp: string;
}

// Health check response
export interface HealthResponse {
  message: string;
  timestamp: string;
  uptime?: number;
  memory?: {
    used: string;
    total: string;
  };
  environment?: string;
  version?: string;
}