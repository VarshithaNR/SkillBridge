import { z } from 'zod';

// Mirrors server/src/validators/problem.validator.ts (createProblemSchema).
export const createProblemFormSchema = z
  .object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
    description: z
      .string()
      .trim()
      .min(20, 'Description must be at least 20 characters')
      .max(5000),
    category: z.string().trim().min(2, 'Category is required').max(60),
    skillsInput: z.string().trim().optional(), // comma-separated in the form, split before submit
    budgetMin: z.coerce.number().min(0, 'Budget cannot be negative'),
    budgetMax: z.coerce.number().min(0, 'Budget cannot be negative'),
    deadline: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
      errorMap: () => ({ message: 'Choose a difficulty level' }),
    }),
    locationType: z.enum(['remote', 'onsite', 'hybrid']),
    location: z.string().trim().max(120).optional(),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['budgetMax'],
  });

export type CreateProblemFormValues = z.infer<typeof createProblemFormSchema>;
