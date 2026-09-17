import { useQuery } from '@tanstack/react-query';
import { getProblem } from '../services/problem.service';

export function useProblem(id: string | undefined) {
  return useQuery({
    queryKey: ['problem', id],
    queryFn: () => getProblem(id as string),
    enabled: Boolean(id),
  });
}
