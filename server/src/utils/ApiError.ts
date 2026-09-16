/**
 * A typed application error. Throwing this anywhere in a controller/service
 * lets the central error-handling middleware respond with the right HTTP
 * status and a clean, client-safe message instead of leaking stack traces
 * or internal details.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
