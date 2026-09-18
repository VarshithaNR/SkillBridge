import { useQuery } from '@tanstack/react-query';
import { getMyProposals } from '../services/proposal.service';
import type { ProposalListQuery } from '../types/proposal';

export function useMyProposals(query: ProposalListQuery = {}, enabled = true) {
  return useQuery({
    queryKey: ['myProposals', query],
    queryFn: () => getMyProposals(query),
    enabled,
  });
}
