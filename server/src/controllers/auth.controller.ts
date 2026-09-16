import { Request, Response } from 'express';
import { CookieOptions } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { parseDurationMs } from '../utils/duration';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';

const REFRESH_COOKIE_NAME = 'refreshToken';

/**
 * The refresh token lives in an httpOnly cookie — invisible to JavaScript,
 * which removes it from the XSS attack surface entirely. The access token,
 * by contrast, is returned in the JSON body for the client to hold in
 * memory (Zustand), never localStorage. `secure` is only enforced in
 * production so this still works over plain http on localhost in dev.
 */
function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: parseDurationMs(env.JWT_REFRESH_EXPIRY),
    path: '/api/auth',
  };
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const user = await authService.registerUser(input);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.loginUser(input);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: { user, accessToken },
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, 'No refresh token provided');
  }

  const { accessToken, refreshToken } = await authService.refreshAccessToken(token);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: { accessToken },
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  if (token) {
    await authService.logoutUser(token);
  }

  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  // authenticate middleware guarantees req.user is set before this runs
  const user = await authService.getUserProfile(req.user!.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});
