import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import User from '../models/user.model';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Primary: Extract from secure HttpOnly cookie
    // 2. Fallback: Extract from Authorization Bearer header (for API clients, tests, mobile)
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    const token = cookieToken || headerToken;

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No authentication token provided.',
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
