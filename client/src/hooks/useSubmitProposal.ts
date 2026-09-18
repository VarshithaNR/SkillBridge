import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProposal } from '../services/proposal.service';
import type { SubmitProposalPayload } from '../types/proposal';

export function useSubmitProposal(problemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitProposalPayload) => createProposal(problemId, payload),
    onSuccess: () => {
      // The problem details page derives "already submitted" state from this
      // list, and My Proposals shows the new entry.
      queryClient.invalidateQueries({ queryKey: ['myProposals'] });
    },
  });
}
