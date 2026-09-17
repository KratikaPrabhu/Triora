import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log full error details on the server
  logger.error(
    `[Error] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`,
    {
      stack: err.stack
    }
  );

  // Send only safe information to the client
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode
    }
  });
};

export default errorHandler;