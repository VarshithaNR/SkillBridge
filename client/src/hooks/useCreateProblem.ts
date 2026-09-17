import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProblem } from '../services/problem.service';

export function useCreateProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProblem,
    onSuccess: () => {
      // Invalidate rather than manually patch the cache — simpler and
      // correct even though pagination/filters make the exact insertion
      // point non-obvious.
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });
}
