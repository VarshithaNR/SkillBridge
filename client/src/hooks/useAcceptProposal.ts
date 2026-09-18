import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptProposal } from '../services/proposal.service';

export function useAcceptProposal(problemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptProposal,
    onSuccess: () => {
      // Accepting flips the problem to "assigned" and auto-rejects every
      // other pending proposal — refresh both so the page reflects that
      // without a manual reload.
      queryClient.invalidateQueries({ queryKey: ['problemProposals', problemId] });
      queryClient.invalidateQueries({ queryKey: ['problem', problemId] });
    },
  });
}
