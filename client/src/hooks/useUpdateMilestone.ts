import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMilestone } from '../services/milestone.service';
import type { UpdateMilestonePayload } from '../types/milestone';

export function useUpdateMilestone(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMilestonePayload }) =>
      updateMilestone(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', projectId] });
    },
  });
}
