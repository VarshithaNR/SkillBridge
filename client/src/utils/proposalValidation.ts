import { z } from 'zod';

// Mirrors server/src/validators/proposal.validator.ts (createProposalSchema).
export const submitProposalFormSchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .min(20, 'Cover letter must be at least 20 characters')
    .max(3000),
  proposedBudget: z.coerce.number().min(0, 'Proposed budget cannot be negative'),
  estimatedDuration: z.string().trim().max(60).optional(),
});

export type SubmitProposalFormValues = z.infer<typeof submitProposalFormSchema>;
