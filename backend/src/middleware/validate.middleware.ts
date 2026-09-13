import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorDetails = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      res.status(400).json({
        success: false,
        error: {
          message: 'Validation Error',
          statusCode: 400,
          details: errorDetails
        }
      });
      return;
    }

    req.body = result.data;
    next();
  };
};

export default validateBody;
