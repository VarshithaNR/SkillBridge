import { useQuery } from '@tanstack/react-query';
import { getProblems } from '../services/problem.service';
import type { ProblemListQuery } from '../types/problem';

export function useProblems(query: ProblemListQuery) {
  return useQuery({
    // Every filter/page value is part of the cache key, so changing a
    // filter automatically triggers a refetch instead of showing stale data.
    queryKey: ['problems', query],
    queryFn: () => getProblems(query),
    placeholderData: (previousData) => previousData, // keeps old page visible while the next loads
  });
}
