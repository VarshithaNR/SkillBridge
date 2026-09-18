import { z } from 'zod';

const statusEnum = z.enum(['pending', 'accepted', 'rejected', 'withdrawn']);

export const createProposalSchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .min(20, 'Cover letter must be at least 20 characters')
    .max(3000),
  proposedBudget: z.coerce.number().min(0, 'Proposed budget cannot be negative'),
  estimatedDuration: z.string().trim().max(60).optional(),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;

export const listProposalsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: statusEnum.optional(),
});

export type ListProposalsQuery = z.infer<typeof listProposalsQuerySchema>;
