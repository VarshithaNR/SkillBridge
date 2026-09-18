import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type { Pagination } from '../types/problem';
import type {
  MyProposal,
  ProblemProposal,
  ProposalListQuery,
  ProposalRecord,
  SubmitProposalPayload,
} from '../types/proposal';

export async function createProposal(
  problemId: string,
  payload: SubmitProposalPayload
): Promise<ProposalRecord> {
  const { data } = await apiClient.post<ApiResponse<{ proposal: ProposalRecord }>>(
    `/problems/${problemId}/proposals`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to submit proposal');
  return data.data.proposal;
}

export async function getProblemProposals(
  problemId: string,
  query: ProposalListQuery = {}
): Promise<{ proposals: ProblemProposal[]; pagination: Pagination }> {
  const { data } = await apiClient.get<
    ApiResponse<{ proposals: ProblemProposal[]; pagination: Pagination }>
  >(`/problems/${problemId}/proposals`, { params: query });
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load proposals');
  return data.data;
}

export async function getMyProposals(
  query: ProposalListQuery = {}
): Promise<{ proposals: MyProposal[]; pagination: Pagination }> {
  const { data } = await apiClient.get<ApiResponse<{ proposals: MyProposal[]; pagination: Pagination }>>(
    '/proposals/me',
    { params: query }
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to load your proposals');
  return data.data;
}

export async function acceptProposal(proposalId: string): Promise<ProposalRecord> {
  const { data } = await apiClient.patch<ApiResponse<{ proposal: ProposalRecord }>>(
    `/proposals/${proposalId}/accept`
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to accept proposal');
  return data.data.proposal;
}

export async function rejectProposal(proposalId: string): Promise<ProposalRecord> {
  const { data } = await apiClient.patch<ApiResponse<{ proposal: ProposalRecord }>>(
    `/proposals/${proposalId}/reject`
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to reject proposal');
  return data.data.proposal;
}

export async function withdrawProposal(proposalId: string): Promise<ProposalRecord> {
  const { data } = await apiClient.patch<ApiResponse<{ proposal: ProposalRecord }>>(
    `/proposals/${proposalId}/withdraw`
  );
  if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to withdraw proposal');
  return data.data.proposal;
}
