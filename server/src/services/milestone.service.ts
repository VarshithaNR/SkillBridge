import { Milestone, IMilestone } from '../models/Milestone';
import { ApiError } from '../utils/ApiError';
import { getProjectForMember } from './project.service';
import type { CreateMilestoneInput, UpdateMilestoneInput } from '../validators/milestone.validator';

interface Actor {
  id: string;
  role: 'developer' | 'business' | 'admin';
}

function assertIsBusinessOwnerOrAdmin(businessId: string, actor: Actor): void {
  const isBusinessOwner = businessId === actor.id && actor.role === 'business';
  if (!isBusinessOwner && actor.role !== 'admin') {
    throw new ApiError(403, 'Only the business that owns this project can do that');
  }
}

export async function createMilestone(
  projectId: string,
  actor: Actor,
  input: CreateMilestoneInput
): Promise<IMilestone> {
  const project = await getProjectForMember(projectId, actor);
  assertIsBusinessOwnerOrAdmin(project.business.toString(), actor);

  const order = input.order ?? (await Milestone.countDocuments({ project: project._id }));

  return Milestone.create({
    project: project._id,
    title: input.title,
    description: input.description,
    amount: input.amount,
    dueDate: input.dueDate,
    order,
  });
}

export async function listMilestonesForProject(
  projectId: string,
  actor: Actor
): Promise<IMilestone[]> {
  const project = await getProjectForMember(projectId, actor);
  return Milestone.find({ project: project._id }).sort({ order: 1, createdAt: 1 });
}

export async function updateMilestone(
  id: string,
  actor: Actor,
  input: UpdateMilestoneInput
): Promise<IMilestone> {
  const milestone = await Milestone.findById(id);
  if (!milestone) throw new ApiError(404, 'Milestone not found');

  const project = await getProjectForMember(milestone.project.toString(), actor);

  const isBusinessOwner = project.business.toString() === actor.id && actor.role === 'business';
  const isDeveloper = project.developer.toString() === actor.id && actor.role === 'developer';
  const isAdmin = actor.role === 'admin';

  const { status, ...planFields } = input;
  const hasPlanFieldChanges = Object.values(planFields).some((v) => v !== undefined);

  if (hasPlanFieldChanges) {
    // Only the business (or an admin) can edit the milestone plan itself.
    if (!isBusinessOwner && !isAdmin) {
      throw new ApiError(403, 'Only the business that owns this project can edit a milestone');
    }
    if (milestone.status === 'approved') {
      throw new ApiError(400, 'An approved milestone can no longer be edited');
    }
    Object.assign(milestone, planFields);
  }

  if (status) {
    applyStatusTransition(milestone, status, { isBusinessOwner, isDeveloper, isAdmin });
  }

  await milestone.save();
  return milestone;
}

/**
 * Enforces who may move a milestone into which state:
 * - developer: pending/in_progress -> in_progress, pending/in_progress -> submitted
 * - business: submitted -> approved, submitted -> rejected (rejected work can be resubmitted)
 * - admin: any transition, for support/override purposes
 */
function applyStatusTransition(
  milestone: IMilestone,
  nextStatus: IMilestone['status'],
  actor: { isBusinessOwner: boolean; isDeveloper: boolean; isAdmin: boolean }
): void {
  const from = milestone.status;

  if (actor.isAdmin) {
    milestone.status = nextStatus;
    return;
  }

  if (actor.isDeveloper) {
    const developerAllowed =
      (from === 'pending' && (nextStatus === 'in_progress' || nextStatus === 'submitted')) ||
      (from === 'in_progress' && nextStatus === 'submitted') ||
      (from === 'rejected' && (nextStatus === 'in_progress' || nextStatus === 'submitted'));

    if (!developerAllowed) {
      throw new ApiError(400, `Cannot move a milestone from "${from}" to "${nextStatus}" as the developer`);
    }
    milestone.status = nextStatus;
    return;
  }

  if (actor.isBusinessOwner) {
    const businessAllowed = from === 'submitted' && (nextStatus === 'approved' || nextStatus === 'rejected');

    if (!businessAllowed) {
      throw new ApiError(400, `Cannot move a milestone from "${from}" to "${nextStatus}" as the business`);
    }
    milestone.status = nextStatus;
    return;
  }

  throw new ApiError(403, 'You do not have permission to change this milestone status');
}

export async function deleteMilestone(id: string, actor: Actor): Promise<void> {
  const milestone = await Milestone.findById(id);
  if (!milestone) throw new ApiError(404, 'Milestone not found');

  const project = await getProjectForMember(milestone.project.toString(), actor);
  assertIsBusinessOwnerOrAdmin(project.business.toString(), actor);

  if (milestone.status === 'approved') {
    throw new ApiError(400, 'An approved milestone can no longer be deleted');
  }

  await milestone.deleteOne();
}
