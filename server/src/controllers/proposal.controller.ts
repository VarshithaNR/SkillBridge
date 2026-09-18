import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { createProposalSchema, listProposalsQuerySchema } from '../validators/proposal.validator';
import * as proposalService from '../services/proposal.service';

export const submit = catchAsync(async (req: Request, res: Response) => {
  // developer id always comes from the verified token (req.user), never from
  // the request body — same reasoning as postedBy on problem.controller.
  const input = createProposalSchema.parse(req.body);
  const proposal = await proposalService.submitProposal(req.params.problemId, req.user!.id, input);

  res.status(201).json({ success: true, message: 'Proposal submitted', data: { proposal } });
});

export const listForProblem = catchAsync(async (req: Request, res: Response) => {
  const query = listProposalsQuerySchema.parse(req.query);
  const result = await proposalService.listProposalsForProblem(req.params.problemId, req.user!, query);

  res.status(200).json({
    success: true,
    data: {
      proposals: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    },
  });
});

export const listMine = catchAsync(async (req: Request, res: Response) => {
  const query = listProposalsQuerySchema.parse(req.query);
  const result = await proposalService.listMyProposals(req.user!.id, query);

  res.status(200).json({
    success: true,
    data: {
      proposals: result.items,
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
  const proposal = await proposalService.getProposalById(req.params.id, req.user!);
  res.status(200).json({ success: true, data: { proposal } });
});

export const accept = catchAsync(async (req: Request, res: Response) => {
  const proposal = await proposalService.acceptProposal(req.params.id, req.user!);
  res.status(200).json({ success: true, message: 'Proposal accepted', data: { proposal } });
});

export const reject = catchAsync(async (req: Request, res: Response) => {
  const proposal = await proposalService.rejectProposal(req.params.id, req.user!);
  res.status(200).json({ success: true, message: 'Proposal rejected', data: { proposal } });
});

export const withdraw = catchAsync(async (req: Request, res: Response) => {
  const proposal = await proposalService.withdrawProposal(req.params.id, req.user!);
  res.status(200).json({ success: true, message: 'Proposal withdrawn', data: { proposal } });
});

// Same purpose as problem.controller's validateIdParam, generalized to cover
// both :problemId (nested proposal routes) and :id (direct proposal routes)
// since both are Mongo ObjectIds.
export const validateIdParam =
  (paramName: 'id' | 'problemId') =>
  (req: Request, _res: Response, next: (err?: unknown) => void) => {
    const isValidObjectId = /^[a-f\d]{24}$/i.test(req.params[paramName]);
    if (!isValidObjectId) {
      next(new ApiError(400, `Invalid ${paramName === 'problemId' ? 'problem' : 'proposal'} id`));
      return;
    }
    next();
  };
