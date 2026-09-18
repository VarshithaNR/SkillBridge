import { FilterQuery } from 'mongoose';
import { Project, IProject } from '../models/Project';
import { ApiError } from '../utils/ApiError';
import type { ListProjectsQuery, UpdateProjectInput } from '../validators/project.validator';
import type { PaginatedResult } from './problem.service';

interface Actor {
  id: string;
  role: 'developer' | 'business' | 'admin';
}

const MEMBER_POPULATE = [
  { path: 'business', select: 'name email businessName' },
  { path: 'developer', select: 'name email' },
  { path: 'problem', select: 'title status' },
];

/** Never trusts the caller — a project is only ever returned to a business owner, the assigned developer, or an admin. */
function assertIsMember(project: IProject, actor: Actor): void {
  const isBusiness = project.business.toString() === actor.id;
  const isDeveloper = project.developer.toString() === actor.id;
  if (!isBusiness && !isDeveloper && actor.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to access this project');
  }
}

export async function listProjectsForActor(
  actor: Actor,
  query: ListProjectsQuery
): Promise<PaginatedResult<IProject>> {
  const filter: FilterQuery<IProject> = {};
  if (query.status) filter.status = query.status;

  if (actor.role === 'business') filter.business = actor.id;
  else if (actor.role === 'developer') filter.developer = actor.id;
  // admin: no member filter — sees every project

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate(MEMBER_POPULATE),
    Project.countDocuments(filter),
  ]);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getProjectById(id: string, actor: Actor): Promise<IProject> {
  const project = await Project.findById(id).populate(MEMBER_POPULATE);
  if (!project) throw new ApiError(404, 'Project not found');
  assertIsMember(project, actor);
  return project;
}

export async function updateProject(
  id: string,
  actor: Actor,
  input: UpdateProjectInput
): Promise<IProject> {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');
  assertIsMember(project, actor);

  const isBusinessOwner = project.business.toString() === actor.id;
  if (!isBusinessOwner && actor.role !== 'admin') {
    throw new ApiError(403, 'Only the business that owns this project can update it');
  }

  project.status = input.status;
  if (input.status === 'completed' && !project.completedAt) {
    project.completedAt = new Date();
  }
  await project.save();
  await project.populate(MEMBER_POPULATE);
  return project;
}

export async function getProjectMembers(
  id: string,
  actor: Actor
): Promise<{ business: unknown; developer: unknown }> {
  const project = await Project.findById(id).populate(MEMBER_POPULATE);
  if (!project) throw new ApiError(404, 'Project not found');
  assertIsMember(project, actor);
  return { business: project.business, developer: project.developer };
}

/** Used by the milestone service to check membership without duplicating the logic. */
export async function getProjectForMember(id: string, actor: Actor): Promise<IProject> {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');
  assertIsMember(project, actor);
  return project;
}
