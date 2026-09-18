import { useQuery } from '@tanstack/react-query';
import { getProjectMilestones } from '../services/milestone.service';

export function useProjectMilestones(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projectMilestones', projectId],
    queryFn: () => getProjectMilestones(projectId!),
    enabled: !!projectId,
  });
}
