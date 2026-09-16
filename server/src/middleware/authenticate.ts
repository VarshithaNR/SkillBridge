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
