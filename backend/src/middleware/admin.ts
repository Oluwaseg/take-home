import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ApiResponse, logger } from '../utils/responseHandler';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      logger.warn('Admin access denied - no user in request');
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      logger.warn(`Admin access denied for user: ${req.user.username} (${req.user._id}) - role: ${req.user.role}`);
      return ApiResponse.forbidden(res, 'Admin access required. You do not have permission to perform this action.');
    }

    logger.debug(`Admin access granted to: ${req.user.username}`);
    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    return ApiResponse.error(res, 'Authorization check failed', 500, error);
  }
};

// Optional admin check - adds admin flag to request
export const checkAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      const isAdmin = req.user.role === 'admin';
      logger.debug(`Admin check for ${req.user.username}: ${isAdmin ? 'Yes' : 'No'} (role: ${req.user.role})`);
    }
    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    next(); // Don't fail on admin check errors
  }
};