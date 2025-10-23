import { Response } from 'express';

export class ApiResponse {
  private static request_count = 0;
  static success(res: Response, data: any = null, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res: Response, message: string = 'Something went wrong', statusCode: number = 500, error?: any) {
    if (error) {
      console.error(`[${new Date().toISOString()}] Error:`, {
        message,
        error: error.message || error,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }

    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      timestamp: new Date().toISOString()
    });
  }

  static validationError(res: Response, errors: any[]) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.map(err => ({
        field: err.path?.join('.') || 'unknown',
        message: err.message
      })),
      timestamp: new Date().toISOString()
    });
  }

  static notFound(res: Response, resource: string = 'Resource') {
    return res.status(404).json({
      success: false,
      message: `${resource} not found`,
      timestamp: new Date().toISOString()
    });
  }

  static unauthorized(res: Response, message: string = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  static forbidden(res: Response, message: string = 'Access denied') {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  static created(res: Response, data: any, message: string = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(res: Response, data: any[], pagination: any, message: string = 'Data retrieved successfully') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    });
  }
}

// Custom logger (simple but effective)
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  }
};
