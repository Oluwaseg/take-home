import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { CartItem, Product } from '../types';
// import { logger } from '../utils/logger';
// import { someCartUtil } from '../utils/cart-helpers';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem('cart');
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      // console.log('Cart saved:', items.length, 'items');
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product._id === product._id);
      
      if (existingItem) {
        // Update existing item
        const newItems = prevItems.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        
        toast.success(`${product.name} quantity updated! (${existingItem.quantity + quantity})`);
        return newItems;
      } else {
        // Add new item
        const newItem = { product, quantity };
        const newItems = [...prevItems, newItem];
        
        toast.success(`${product.name} added to cart! 🛒`);
        return newItems;
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product._id === productId);
      if (itemToRemove) {
        toast.success(`${itemToRemove.product.name} removed from cart`);
      }
      
      return prevItems.filter(item => item.product._id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems => {
      return prevItems.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart cleared! 🗑️');
  };

  const getTotalItems = (): number => {
    const total = items.reduce((total, item) => total + item.quantity, 0);
    return total;
  };

  const getTotalPrice = (): number => {
    const total = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    return total;
  };

  const isInCart = (productId: string): boolean => {
    return items.some(item => item.product._id === productId);
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};