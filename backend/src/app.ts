import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
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
  'https://triora-gules.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // 1. Allow same-origin / server-to-server / curl requests (no origin header)
    // 2. Allow explicitly whitelisted frontend domains in allowedOrigins
    // 3. Allow all origins ONLY in local development
    if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn(`[CORS Blocked] Unauthorized origin attempted access: ${origin}`);
      callback(new Error(`CORS blocked: Origin ${origin} is not allowed.`));
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

// Cookie parser for secure HttpOnly session tokens
app.use(cookieParser());

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Injection / MongoDB Query Sanitization
// Recursively sanitizes prohibited characters ($ and .) from req.body, req.query, and req.params
app.use(mongoSanitize({ replaceWith: '_' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`HTTP ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes (mounted under both /api and / for robustness against missing /api prefix in client URLs)
app.use('/api', apiRouter);
app.use('/', apiRouter);

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
