import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectProposal } from '../services/proposal.service';

export function useRejectProposal(problemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problemProposals', problemId] });
    },
  });
}
