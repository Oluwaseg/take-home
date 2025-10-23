import express, { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ApiResponse, logger } from '../utils/responseHandler';
import { validate, validationSchemas } from '../utils/validation';

const router: express.Router = express.Router();
const max_login_attempts = 5;

router.post('/register', validate(validationSchemas.register), async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    logger.info(`Registration attempt for username: ${username}`);

    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      logger.warn(`Registration failed - user already exists: ${username}`);
      return ApiResponse.error(res, 'Username already taken', 409);
    }

    const user = new User({ username, password });
    await user.save();

    // Generate token
    const token = generateToken((user._id as any).toString());

    logger.info(`User registered successfully: ${username}`);

    const userResponse = {
      _id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    };

    return ApiResponse.created(res, {
      user: userResponse,
      token
    }, 'Account created successfully! Welcome aboard! 🎉');

  } catch (error: any) {
    logger.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return ApiResponse.error(res, 'Username or email already exists', 409);
    }
    
    return ApiResponse.error(res, 'Failed to create account. Please try again.', 500, error);
  }
});

// Login endpoint - with some personality
router.post('/login', validate(validationSchemas.login), async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    logger.info(`Login attempt for username: ${username}`);

    // Find user by username or email
    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user) {
      logger.warn(`Login failed - user not found: ${username}`);
      return ApiResponse.unauthorized(res, 'Invalid credentials. Please check your username and password.');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Login failed - wrong password for user: ${username}`);
      return ApiResponse.unauthorized(res, 'Invalid credentials. Please check your username and password.');
    }

    // Generate token
    const token = generateToken((user._id as any).toString());

    logger.info(`User logged in successfully: ${username}`);

    // Prepare user response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLogin: new Date()
    };

    return ApiResponse.success(res, {
      user: userResponse,
      token
    }, `Welcome back, ${user.username}! 👋`);

  } catch (error: any) {
    logger.error('Login error:', error);
    return ApiResponse.error(res, 'Login failed. Please try again later.', 500, error);
  }
});

// Get current user - with some debugging
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      logger.warn(`User not found for ID: ${req.user._id}`);
      return ApiResponse.notFound(res, 'User');
    }

    logger.debug(`User profile requested: ${user.username}`);

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return ApiResponse.success(res, userResponse, 'User profile retrieved successfully');

  } catch (error: any) {
    logger.error('Get user profile error:', error);
    return ApiResponse.error(res, 'Failed to retrieve user profile', 500, error);
  }
});

// Logout endpoint (client-side token removal, but we can log it)
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    logger.info(`User logged out: ${req.user.username}`);
    
    // In a real app, you might want to blacklist the token
    // For now, just acknowledge the logout
    return ApiResponse.success(res, null, 'Logged out successfully. See you next time! 👋');

  } catch (error: any) {
    logger.error('Logout error:', error);
    return ApiResponse.error(res, 'Logout failed', 500, error);
  }
});

// Health check for auth service
router.get('/health', (req: Request, res: Response) => {
  return ApiResponse.success(res, {
    service: 'Authentication Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, 'Auth service is running smoothly');
});

export default router;