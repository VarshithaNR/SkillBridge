import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMilestone } from '../services/milestone.service';
import type { CreateMilestonePayload } from '../types/milestone';

export function useCreateMilestone(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMilestonePayload) => createMilestone(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', projectId] });
    },
  });
}
