import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  CreateProblemPayload,
  ProblemDetailData,
  ProblemListData,
  ProblemListQuery,
  UpdateProblemPayload,
} from '../types/problem';

export async function getProblems(query: ProblemListQuery = {}): Promise<ProblemListData> {
  const { data } = await apiClient.get<ApiResponse<ProblemListData>>('/problems', {
    params: query,
  });
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load problems');
  return data.data;
}

export async function getProblem(id: string): Promise<ProblemDetailData> {
  const { data } = await apiClient.get<ApiResponse<ProblemDetailData>>(`/problems/${id}`);
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load problem');
  return data.data;
}

export async function createProblem(payload: CreateProblemPayload): Promise<ProblemDetailData> {
  const { data } = await apiClient.post<ApiResponse<ProblemDetailData>>('/problems', payload);
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to create problem');
  return data.data;
}

export async function updateProblem(
  id: string,
  payload: UpdateProblemPayload
): Promise<ProblemDetailData> {
  const { data } = await apiClient.patch<ApiResponse<ProblemDetailData>>(
    `/problems/${id}`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to update problem');
  return data.data;
}

export async function deleteProblem(id: string): Promise<void> {
  await apiClient.delete(`/problems/${id}`);
}
