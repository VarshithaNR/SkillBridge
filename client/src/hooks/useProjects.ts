import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../services/project.service';
import type { ProjectListQuery } from '../types/project';

export function useProjects(query: ProjectListQuery = {}) {
  return useQuery({
    queryKey: ['projects', query],
    queryFn: () => getProjects(query),
    placeholderData: (previousData) => previousData,
  });
}
