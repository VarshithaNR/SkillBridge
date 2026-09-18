import { useQuery } from '@tanstack/react-query';
import { getProblemProposals } from '../services/proposal.service';
import type { ProposalListQuery } from '../types/proposal';

export function useProblemProposals(problemId: string | undefined, query: ProposalListQuery = {}) {
  return useQuery({
    queryKey: ['problemProposals', problemId, query],
    queryFn: () => getProblemProposals(problemId as string, query),
    enabled: Boolean(problemId),
  });
}
