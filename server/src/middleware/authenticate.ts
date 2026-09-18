import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Expects `Authorization: Bearer <accessToken>`. The access token is short-
 * lived and kept in memory on the client (never localStorage), so reading it
 * from a header — not a cookie — is intentional and matches that design.
 *
 * On success, attaches `{ id, role }` to `req.user` for downstream handlers
 * and role-authorization middleware to use. Never trusts anything the client
 * claims outside of what's inside a token we ourselves signed and verified.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired access token'));
  }
}

/**
 * Same as `authenticate`, but never rejects the request — used on routes
 * that are public but behave differently when the caller happens to be
 * logged in (e.g. GET /problems?mine=true for a business). A missing or
 * invalid token simply leaves `req.user` unset.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // Invalid/expired token on an optional-auth route — proceed as anonymous.
  }
  next();
}

/**
 * Same token verification as `authenticate`, but never rejects the request
 * when no token is present or it's invalid — it just leaves `req.user`
 * unset. Used on routes that are public but behave differently for a signed-
 * in caller (e.g. GET /problems?mine=true for a business's own listings).
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // Invalid/expired token on an otherwise-public route — just proceed unauthenticated.
  }
  next();
}
