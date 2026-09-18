import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  CreateMilestonePayload,
  Milestone,
  UpdateMilestonePayload,
} from '../types/milestone';

export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  const { data } = await apiClient.get<ApiResponse<{ milestones: Milestone[] }>>(
    `/projects/${projectId}/milestones`
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load milestones');
  return data.data.milestones;
}

export async function createMilestone(
  projectId: string,
  payload: CreateMilestonePayload
): Promise<Milestone> {
  const { data } = await apiClient.post<ApiResponse<{ milestone: Milestone }>>(
    `/projects/${projectId}/milestones`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to create milestone');
  return data.data.milestone;
}

export async function updateMilestone(
  id: string,
  payload: UpdateMilestonePayload
): Promise<Milestone> {
  const { data } = await apiClient.patch<ApiResponse<{ milestone: Milestone }>>(
    `/milestones/${id}`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to update milestone');
  return data.data.milestone;
}

export async function deleteMilestone(id: string): Promise<void> {
  await apiClient.delete(`/milestones/${id}`);
}
