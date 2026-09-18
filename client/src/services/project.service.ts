import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  Project,
  ProjectDetailData,
  ProjectListData,
  ProjectListQuery,
  UpdateProjectPayload,
} from '../types/project';

export async function getProjects(query: ProjectListQuery = {}): Promise<ProjectListData> {
  const { data } = await apiClient.get<ApiResponse<ProjectListData>>('/projects', {
    params: query,
  });
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load projects');
  return data.data;
}

export async function getProject(id: string): Promise<ProjectDetailData> {
  const { data } = await apiClient.get<ApiResponse<ProjectDetailData>>(`/projects/${id}`);
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load project');
  return data.data;
}

export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<{ project: Project }> {
  const { data } = await apiClient.patch<ApiResponse<{ project: Project }>>(
    `/projects/${id}`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to update project');
  return data.data;
}
