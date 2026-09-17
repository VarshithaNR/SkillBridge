import { z } from 'zod';

const difficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);
const locationTypeEnum = z.enum(['remote', 'onsite', 'hybrid']);
const statusEnum = z.enum([
  'open',
  'in_review',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
]);

export const createProblemSchema = z
  .object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
    description: z.string().trim().min(20, 'Description must be at least 20 characters').max(5000),
    category: z.string().trim().min(2, 'Category is required').max(60),
    requiredSkills: z
      .array(z.string().trim().min(1))
      .max(20, 'Provide at most 20 skills')
      .default([]),
    budgetMin: z.coerce.number().min(0, 'Budget cannot be negative'),
    budgetMax: z.coerce.number().min(0, 'Budget cannot be negative'),
    deadline: z.coerce.date().optional(),
    difficulty: difficultyEnum,
    locationType: locationTypeEnum.default('remote'),
    location: z.string().trim().max(120).optional(),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: 'budgetMax must be greater than or equal to budgetMin',
    path: ['budgetMax'],
  });

export type CreateProblemInput = z.infer<typeof createProblemSchema>;

// Same shape, but every field optional — a PATCH may update just one field.
// Re-declared (not `.partial()` on createProblemSchema) because that schema
// is a ZodEffects (due to `.refine`), which doesn't support `.partial()`.
export const updateProblemSchema = z
  .object({
    title: z.string().trim().min(5).max(150),
    description: z.string().trim().min(20).max(5000),
    category: z.string().trim().min(2).max(60),
    requiredSkills: z.array(z.string().trim().min(1)).max(20),
    budgetMin: z.coerce.number().min(0),
    budgetMax: z.coerce.number().min(0),
    deadline: z.coerce.date(),
    difficulty: difficultyEnum,
    locationType: locationTypeEnum,
    location: z.string().trim().max(120),
    status: statusEnum,
  })
  .partial()
  .refine(
    (data) =>
      data.budgetMin === undefined ||
      data.budgetMax === undefined ||
      data.budgetMax >= data.budgetMin,
    { message: 'budgetMax must be greater than or equal to budgetMin', path: ['budgetMax'] }
  );

export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;

export const listProblemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().optional(),
  skill: z.string().trim().optional(),
  difficulty: difficultyEnum.optional(),
  locationType: locationTypeEnum.optional(),
  status: statusEnum.optional(),
  minBudget: z.coerce.number().min(0).optional(),
  maxBudget: z.coerce.number().min(0).optional(),
});

export type ListProblemsQuery = z.infer<typeof listProblemsQuerySchema>;
