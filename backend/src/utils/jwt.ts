import jwt from 'jsonwebtoken';
import { logger } from './responseHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Generate JWT token with some additional claims
export const generateToken = (userId: string): string => {
  try {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000), // Issued at
      type: 'access' // Token type for future use
    };

    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'product-listing-api',
      audience: 'product-listing-client'
    } as jwt.SignOptions);

    logger.debug(`JWT token generated for user: ${userId}`);
    return token;
  } catch (error) {
    logger.error('JWT generation error:', error);
    throw new Error('Failed to generate token');
  }
};

// Verify JWT token with better error handling
export const verifyToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'product-listing-api',
      audience: 'product-listing-client'
    }) as { userId: string; iat: number; exp: number };

    // Check if token is expired (additional check)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      throw new Error('Token has expired');
    }

    logger.debug(`JWT token verified for user: ${decoded.userId}`);
    return { userId: decoded.userId };
  } catch (error) {
    logger.warn('JWT verification failed:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Generate refresh token (for future use)
export const generateRefreshToken = (userId: string): string => {
  try {
    const payload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '30d', // Refresh tokens last longer
      issuer: 'product-listing-api',
      audience: 'product-listing-client'
    } as jwt.SignOptions);

    logger.debug(`Refresh token generated for user: ${userId}`);
    return token;
  } catch (error) {
    logger.error('Refresh token generation error:', error);
    throw new Error('Failed to generate refresh token');
  }
};

// Decode token without verification (for debugging)
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Token decode error:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    logger.error('Token expiration check error:', error);
    return true;
  }
};