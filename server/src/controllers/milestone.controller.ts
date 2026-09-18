import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { createMilestoneSchema, updateMilestoneSchema } from '../validators/milestone.validator';
import * as milestoneService from '../services/milestone.service';

export const create = catchAsync(async (req: Request, res: Response) => {
  const input = createMilestoneSchema.parse(req.body);
  const milestone = await milestoneService.createMilestone(req.params.projectId, req.user!, input);
  res.status(201).json({ success: true, message: 'Milestone created', data: { milestone } });
});

export const listForProject = catchAsync(async (req: Request, res: Response) => {
  const milestones = await milestoneService.listMilestonesForProject(req.params.projectId, req.user!);
  res.status(200).json({ success: true, data: { milestones } });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const input = updateMilestoneSchema.parse(req.body);
  const milestone = await milestoneService.updateMilestone(req.params.id, req.user!, input);
  res.status(200).json({ success: true, message: 'Milestone updated', data: { milestone } });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await milestoneService.deleteMilestone(req.params.id, req.user!);
  res.status(200).json({ success: true, message: 'Milestone deleted' });
});

export const validateIdParam =
  (paramName: string) =>
  (req: Request, _res: Response, next: (err?: unknown) => void) => {
    const isValidObjectId = /^[a-f\d]{24}$/i.test(req.params[paramName]);
    if (!isValidObjectId) {
      next(new ApiError(400, `Invalid ${paramName === 'projectId' ? 'project' : 'milestone'} id`));
      return;
    }
    next();
  };
