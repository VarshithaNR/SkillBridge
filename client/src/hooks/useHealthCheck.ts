import { useQuery } from '@tanstack/react-query';
import { checkHealth } from '../services/health.service';

/**
 * Wraps the health-check service call in TanStack Query so components get
 * loading/error/data states for free, with caching and retry handled
 * consistently the same way every other server-state hook in this app will be.
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    retry: false, // a failed connection test shouldn't silently retry
  });
}
