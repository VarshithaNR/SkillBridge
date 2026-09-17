import { FilterQuery } from 'mongoose';
import { Problem, IProblem } from '../models/Problem';
import { ApiError } from '../utils/ApiError';
import type {
  CreateProblemInput,
  ListProblemsQuery,
  UpdateProblemInput,
} from '../validators/problem.validator';

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function createProblem(
  postedBy: string,
  input: CreateProblemInput
): Promise<IProblem> {
  return Problem.create({ ...input, postedBy });
}

export async function listProblems(query: ListProblemsQuery): Promise<PaginatedResult<IProblem>> {
  const filter: FilterQuery<IProblem> = {};

  // Public listing defaults to open problems only, unless a specific status
  // is requested (e.g. a business viewing their own completed problems).
  filter.status = query.status ?? 'open';

  if (query.category) filter.category = query.category;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.locationType) filter.locationType = query.locationType;
  if (query.skill) filter.requiredSkills = query.skill.trim().toLowerCase();

  if (query.minBudget !== undefined || query.maxBudget !== undefined) {
    filter.budgetMax = {};
    if (query.minBudget !== undefined) filter.budgetMax.$gte = query.minBudget;
    if (query.maxBudget !== undefined) filter.budgetMin = { $lte: query.maxBudget };
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Problem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate('postedBy', 'name role'),
    Problem.countDocuments(filter),
  ]);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getProblemById(id: string): Promise<IProblem> {
  const problem = await Problem.findById(id).populate('postedBy', 'name role');
  if (!problem) throw new ApiError(404, 'Problem not found');
  return problem;
}

interface Actor {
  id: string;
  role: 'developer' | 'business' | 'admin';
}

function assertCanModify(problem: IProblem, actor: Actor): void {
  const isOwner = problem.postedBy.toString() === actor.id;
  const isAdmin = actor.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to modify this problem');
  }
}

export async function updateProblem(
  id: string,
  actor: Actor,
  input: UpdateProblemInput
): Promise<IProblem> {
  const problem = await Problem.findById(id);
  if (!problem) throw new ApiError(404, 'Problem not found');

  assertCanModify(problem, actor);

  Object.assign(problem, input);
  await problem.save();
  return problem;
}

export async function deleteProblem(id: string, actor: Actor): Promise<void> {
  const problem = await Problem.findById(id);
  if (!problem) throw new ApiError(404, 'Problem not found');

  assertCanModify(problem, actor);

  await problem.deleteOne();
}
