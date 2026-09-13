import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import User from '../models/user.model';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No authentication token provided.',
          statusCode: 401
        }
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. Invalid token format.',
          statusCode: 401
        }
      });
      return;
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token.',
          statusCode: 401
        }
      });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User belonging to this token no longer exists.',
          statusCode: 401
        }
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
