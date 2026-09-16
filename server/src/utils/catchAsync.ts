import { NextFunction, Request, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Express 4 does not automatically forward rejected promises from async
 * route handlers to the error-handling middleware — an unhandled rejection
 * would crash the process instead of producing a clean error response.
 * Wrapping every async controller in this catches that rejection and passes
 * it to `next()`, where the existing central error handler takes over.
 */
export function catchAsync(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
