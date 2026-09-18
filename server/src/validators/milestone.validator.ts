import { z } from 'zod';

const statusEnum = z.enum(['pending', 'in_progress', 'submitted', 'approved', 'rejected']);

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().trim().max(3000).optional(),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  dueDate: z.coerce.date().optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

// Business can edit the plan fields; either member can move `status` through
// its lifecycle, but who is allowed to set *which* status is enforced in the
// service layer (a developer can't jump straight to "approved", etc).
export const updateMilestoneSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(3000).optional(),
  amount: z.coerce.number().min(0).optional(),
  dueDate: z.coerce.date().optional(),
  order: z.coerce.number().int().min(0).optional(),
  status: statusEnum.optional(),
});

export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
