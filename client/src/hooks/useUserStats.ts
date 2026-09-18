import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../services/user.service';

export function useUserStats(enabled = true) {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    enabled,
  });
}
