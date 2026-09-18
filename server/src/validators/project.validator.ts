import { z } from 'zod';

const statusEnum = z.enum(['active', 'completed', 'cancelled']);

// Projects are created automatically on proposal acceptance (see
// proposal.service.ts). The only thing a member can change afterwards is
// status — everything else (parties, budget, description) is fixed at
// creation time and traceable back to the originating problem/proposal.
export const updateProjectSchema = z.object({
  status: statusEnum,
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: statusEnum.optional(),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
