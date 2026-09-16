import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../models/User';

/**
 * Restricts a route to one or more roles. Must run after `authenticate`,
 * since it relies on `req.user` having already been set from a verified
 * token — it never reads a role from the request body/query/params, which
 * would let a client simply claim any role it wants.
 *
 * Usage: router.get('/admin-only', authenticate, requireRole('admin'), handler)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, 'You do not have permission to perform this action'));
      return;
    }

    next();
  };
}
