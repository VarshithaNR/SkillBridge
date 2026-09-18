import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMilestone } from '../services/milestone.service';

export function useDeleteMilestone(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', projectId] });
    },
  });
}
