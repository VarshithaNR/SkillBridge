import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as userService from '../services/user.service';

export const stats = catchAsync(async (_req: Request, res: Response) => {
  const data = await userService.getUserStats();
  res.status(200).json({ success: true, data });
});
