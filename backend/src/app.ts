import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import logger from './config/logger';
import apiRouter from './routes/api.router';
import notFoundHandler from './middleware/notFound.middleware';
import errorHandler from './middleware/error.middleware';

export const app = express();

// Security HTTP headers
app.use(helmet());

// Dynamic CORS configuration supporting local Vite ports & credentials
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Return 200 OK instead of 204 No Content for preflight OPTIONS
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicit preflight handler

// Rate Limiting (skip OPTIONS preflight requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => req.method === 'OPTIONS',
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      statusCode: 429
    }
  }
});
app.use(limiter);

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`HTTP ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// Handle process warnings cleanly
process.on('warning', (e) => {
  if (e.name === 'MaxListenersExceededWarning') return;
  logger.warn(e.stack || e.message);
});

export default app;
