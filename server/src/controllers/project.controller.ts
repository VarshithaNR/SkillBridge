import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { updateProjectSchema, listProjectsQuerySchema } from '../validators/project.validator';
import * as projectService from '../services/project.service';

export const list = catchAsync(async (req: Request, res: Response) => {
  const query = listProjectsQuerySchema.parse(req.query);
  const result = await projectService.listProjectsForActor(req.user!, query);

  res.status(200).json({
    success: true,
    data: {
      projects: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    },
  });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id, req.user!);
  res.status(200).json({ success: true, data: { project } });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const input = updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(req.params.id, req.user!, input);
  res.status(200).json({ success: true, message: 'Project updated', data: { project } });
});

export const getMembers = catchAsync(async (req: Request, res: Response) => {
  const members = await projectService.getProjectMembers(req.params.id, req.user!);
  res.status(200).json({ success: true, data: members });
});

// Same ObjectId-shape guard used throughout (problem.controller, proposal.controller).
export const validateIdParam =
  (paramName: string) =>
  (req: Request, _res: Response, next: (err?: unknown) => void) => {
    const isValidObjectId = /^[a-f\d]{24}$/i.test(req.params[paramName]);
    if (!isValidObjectId) {
      next(new ApiError(400, 'Invalid project id'));
      return;
    }
    next();
  };
