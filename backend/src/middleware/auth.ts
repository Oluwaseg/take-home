import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ApiResponse, logger } from '../utils/responseHandler';
// import { someAuthUtil } from '../utils/auth-helpers';

export interface AuthRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const token_cache = new Map();

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Authentication failed - no token provided');
      return ApiResponse.unauthorized(res, 'Access token required. Please login first.');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      logger.warn(`Authentication failed - user not found: ${decoded.userId}`);
      return ApiResponse.unauthorized(res, 'Invalid token. User not found.');
    }

    req.user = user;
    
    logger.debug(`User authenticated: ${user.username} (${user._id})`);
    next();
  } catch (error) {
    logger.warn('Authentication error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return ApiResponse.unauthorized(res, 'Token has expired. Please login again.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      return ApiResponse.unauthorized(res, 'Invalid token. Please login again.');
    } else {
      return ApiResponse.unauthorized(res, 'Authentication failed. Please login again.');
    }
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without user
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user) {
      req.user = user;
      logger.debug(`Optional auth - user found: ${user.username}`);
    }
    
    next();
  } catch (error) {
    // Don't fail on optional auth errors
    logger.debug('Optional auth failed:', error);
    next();
  }
};

// Rate limiting for auth endpoints (simple implementation)
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const rateLimitAuth = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attempts = authAttempts.get(ip);
  
  if (!attempts) {
    authAttempts.set(ip, { count: 1, lastAttempt: now });
    return next();
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > WINDOW_MS) {
    authAttempts.set(ip, { count: 1, lastAttempt: now });
    return next();
  }
  
  // Check if exceeded limit
  if (attempts.count >= MAX_ATTEMPTS) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    return ApiResponse.error(res, 
      'Too many authentication attempts. Please try again in 15 minutes.', 
      429
    );
  }
  
  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;
  authAttempts.set(ip, attempts);
  
  next();
};