import { Proposal, IProposal } from '../models/Proposal';
import { Problem, IProblem } from '../models/Problem';
import { Project } from '../models/Project';
import { ApiError } from '../utils/ApiError';
import type { CreateProposalInput, ListProposalsQuery } from '../validators/proposal.validator';
import type { PaginatedResult } from './problem.service';

interface Actor {
  id: string;
  role: 'developer' | 'business' | 'admin';
}

/** Narrow Mongo duplicate-key error shape, without pulling in mongoose's own type for it. */
function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

async function getProblemOrThrow(problemId: string): Promise<IProblem> {
  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, 'Problem not found');
  return problem;
}

async function assertProblemOwnerOrAdmin(problem: IProblem, actor: Actor): Promise<void> {
  const isOwner = problem.postedBy.toString() === actor.id;
  if (!isOwner && actor.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
}

export async function submitProposal(
  problemId: string,
  developerId: string,
  input: CreateProposalInput
): Promise<IProposal> {
  const problem = await getProblemOrThrow(problemId);

  if (problem.status !== 'open') {
    throw new ApiError(400, 'This problem is not open for proposals');
  }

  try {
    return await Proposal.create({ ...input, problem: problemId, developer: developerId });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new ApiError(409, 'You have already submitted a proposal for this problem');
    }
    throw err;
  }
}

export async function listProposalsForProblem(
  problemId: string,
  actor: Actor,
  query: ListProposalsQuery
): Promise<PaginatedResult<IProposal>> {
  const problem = await getProblemOrThrow(problemId);
  await assertProblemOwnerOrAdmin(problem, actor);

  const filter: Record<string, unknown> = { problem: problemId };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Proposal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate('developer', 'name role'),
    Proposal.countDocuments(filter),
  ]);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function listMyProposals(
  developerId: string,
  query: ListProposalsQuery
): Promise<PaginatedResult<IProposal>> {
  const filter: Record<string, unknown> = { developer: developerId };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Proposal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate('problem', 'title status budgetMin budgetMax'),
    Proposal.countDocuments(filter),
  ]);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getProposalById(id: string, actor: Actor): Promise<IProposal> {
  const proposal = await Proposal.findById(id);
  if (!proposal) throw new ApiError(404, 'Proposal not found');

  const isDeveloperOwner = proposal.developer.toString() === actor.id;
  if (!isDeveloperOwner && actor.role !== 'admin') {
    const problem = await Problem.findById(proposal.problem);
    const isProblemOwner = !!problem && problem.postedBy.toString() === actor.id;
    if (!isProblemOwner) {
      throw new ApiError(403, 'You do not have permission to view this proposal');
    }
  }

  await proposal.populate([
    { path: 'problem', select: 'title status budgetMin budgetMax postedBy' },
    { path: 'developer', select: 'name role' },
  ]);

  return proposal;
}

export async function acceptProposal(id: string, actor: Actor): Promise<IProposal> {
  const proposal = await Proposal.findById(id);
  if (!proposal) throw new ApiError(404, 'Proposal not found');

  const problem = await getProblemOrThrow(proposal.problem.toString());
  await assertProblemOwnerOrAdmin(problem, actor);

  if (proposal.status !== 'pending') {
    throw new ApiError(400, 'Only a pending proposal can be accepted');
  }
  if (problem.status !== 'open') {
    throw new ApiError(400, 'This problem is no longer open');
  }

  proposal.status = 'accepted';
  await proposal.save();

  problem.status = 'assigned';
  await problem.save();

  // A problem can only be assigned to one developer — every other pending
  // proposal on it is auto-rejected rather than left dangling.
  await Proposal.updateMany(
    { problem: problem._id, _id: { $ne: proposal._id }, status: 'pending' },
    { $set: { status: 'rejected' } }
  );

  // Accepting a proposal is the one and only way a Project comes into
  // existence. `problem` has a unique index on Project, so if this endpoint
  // is somehow called twice (double click, retry) the second create() hits
  // a duplicate-key error, which we swallow — the first call already did
  // the job, this one is a no-op rather than a crash.
  try {
    await Project.create({
      problem: problem._id,
      business: problem.postedBy,
      developer: proposal.developer,
      title: problem.title,
      description: problem.description,
      totalBudget: proposal.proposedBudget,
    });
  } catch (err) {
    if (!isDuplicateKeyError(err)) throw err;
  }

  return proposal;
}

export async function rejectProposal(id: string, actor: Actor): Promise<IProposal> {
  const proposal = await Proposal.findById(id);
  if (!proposal) throw new ApiError(404, 'Proposal not found');

  const problem = await getProblemOrThrow(proposal.problem.toString());
  await assertProblemOwnerOrAdmin(problem, actor);

  if (proposal.status !== 'pending') {
    throw new ApiError(400, 'Only a pending proposal can be rejected');
  }

  proposal.status = 'rejected';
  await proposal.save();
  return proposal;
}

export async function withdrawProposal(id: string, actor: Actor): Promise<IProposal> {
  const proposal = await Proposal.findById(id);
  if (!proposal) throw new ApiError(404, 'Proposal not found');

  const isOwner = proposal.developer.toString() === actor.id;
  if (!isOwner && actor.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to withdraw this proposal');
  }

  if (proposal.status !== 'pending') {
    throw new ApiError(400, 'Only a pending proposal can be withdrawn');
  }

  proposal.status = 'withdrawn';
  await proposal.save();
  return proposal;
}
