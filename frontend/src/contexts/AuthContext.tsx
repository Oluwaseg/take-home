import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { User, AuthResponse } from '../types';
import { authAPI } from '../utils/api';
// import { someAuthUtil } from '../utils/auth-helpers';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean; // Computed property based on user.role
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Computed property for admin check
  const isAdmin = user?.role === 'admin';

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Initializing auth state
      
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Parse stored user data
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          
          // Found stored auth data
          
          // Verify token is still valid by making a test request
          try {
            await authAPI.getCurrentUser();
            // Token validation successful
          } catch (error: any) {
            // Only clear storage if it's actually a 401 (unauthorized) error
            if (error.response?.status === 401) {
              // Token validation failed - unauthorized
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              toast.error('Session expired. Please login again.');
            } else {
              // For other errors (network, server), keep the token but log the issue
              console.warn('Token validation failed due to network/server error, keeping token:', error.message);
            }
          }
        } catch (error) {
          // Invalid stored data, clear it
          console.error('Invalid stored auth data, clearing:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        // No stored auth data found
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Login attempt started
      
      const response: AuthResponse = await authAPI.login(username, password);
      
      // Update state
      setUser(response.data.user);
      setToken(response.data.token);
      
      // Store in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Login successful
      
      toast.success(`Welcome back, ${response.data.user.username}! 👋`);
    } catch (error: any) {
      // Login failed
      throw error;
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    try {
      // Registration attempt started
      
      const response: AuthResponse = await authAPI.register(username, password, email);
      
      // Update state
      setUser(response.data.user);
      setToken(response.data.token);
      
      // Store in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Registration successful
      
      toast.success(`Account created successfully! Welcome, ${response.data.user.username}! 🎉`);
    } catch (error: any) {
      // Registration failed
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Logout started
      
      // Call logout API (optional)
      await authAPI.logout();
      
      // Clear state
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Logout successful
      toast.success('Logged out successfully. See you next time! 👋');
    } catch (error: any) {
      // Even if API call fails, we should still clear local state
      console.warn('Logout API call failed, but clearing local state:', error);
      
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      toast.success('Logged out successfully');
    }
  };

  // Update user data (useful for profile updates) - exported for future use
  // const updateUser = (updatedUser: User) => {
  //   setUser(updatedUser);
  //   localStorage.setItem('user', JSON.stringify(updatedUser));
  //   logger.authEvent('User data updated', { username: updatedUser.username });
  // };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};