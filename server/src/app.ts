import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRouter from './routes';

/**
 * `app.ts` builds the Express application but does NOT start listening.
 * Keeping this separate from `server.ts` means the app can be imported
 * directly in tests (e.g. with supertest) without binding a real port.
 */
export function createApp(): Application {
  const app = express();

  // Security headers on every response.
  app.use(helmet());

  // Only the configured frontend origin may call this API with credentials.
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  // Basic abuse protection. Tightened per-route later (e.g. stricter on /auth).
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
