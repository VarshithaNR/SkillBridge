import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import {
  createProblemSchema,
  listProblemsQuerySchema,
  updateProblemSchema,
} from '../validators/problem.validator';
import * as problemService from '../services/problem.service';

export const create = catchAsync(async (req: Request, res: Response) => {
  // req.user is guaranteed by the authenticate + requireRole('business')
  // middleware chain on this route. postedBy always comes from the verified
  // token, never from the request body — a client-supplied postedBy would
  // let anyone post a problem "as" someone else.
  const input = createProblemSchema.parse(req.body);
  const problem = await problemService.createProblem(req.user!.id, input);

  res.status(201).json({ success: true, message: 'Problem posted', data: { problem } });
});

export const list = catchAsync(async (req: Request, res: Response) => {
  const query = listProblemsQuerySchema.parse(req.query);
  const result = await problemService.listProblems(query);

  res.status(200).json({
    success: true,
    data: {
      problems: result.items,
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
  const problem = await problemService.getProblemById(req.params.id);
  res.status(200).json({ success: true, data: { problem } });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const input = updateProblemSchema.parse(req.body);
  const problem = await problemService.updateProblem(req.params.id, req.user!, input);
  res.status(200).json({ success: true, message: 'Problem updated', data: { problem } });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await problemService.deleteProblem(req.params.id, req.user!);
  res.status(200).json({ success: true, message: 'Problem deleted' });
});

// Guards against an obviously malformed Mongo ObjectId reaching the DB layer,
// which would otherwise surface as an opaque 500 (CastError) instead of a
// clean 400. Used as route middleware before getById/update/remove.
export const validateIdParam = (req: Request, _res: Response, next: (err?: unknown) => void) => {
  const isValidObjectId = /^[a-f\d]{24}$/i.test(req.params.id);
  if (!isValidObjectId) {
    next(new ApiError(400, 'Invalid problem id'));
    return;
  }
  next();
};
