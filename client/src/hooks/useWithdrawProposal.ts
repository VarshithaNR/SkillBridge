import { useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawProposal } from '../services/proposal.service';

export function useWithdrawProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProposals'] });
    },
  });
}
