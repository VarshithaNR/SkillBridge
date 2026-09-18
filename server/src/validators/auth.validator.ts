import { z } from 'zod';

const nameField = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
const emailField = z.string().trim().toLowerCase().email('Must be a valid email address');
const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72) // bcrypt silently truncates beyond 72 bytes — reject earlier instead
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

/**
 * Registration is a discriminated union on `role` so each role only accepts
 * (and requires) the fields relevant to it. "admin" is intentionally never a
 * valid option here — admin accounts are provisioned separately, never
 * chosen by the registering user.
 */
const developerRegisterSchema = z.object({
  role: z.literal('developer'),
  name: nameField,
  email: emailField,
  password: passwordField,
  skills: z.array(z.string().trim().min(1)).max(30).default([]),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  bio: z.string().trim().max(1000).optional(),
});

const businessRegisterSchema = z.object({
  role: z.literal('business'),
  name: nameField, // contact name
  email: emailField,
  password: passwordField,
  businessName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(150),
  businessType: z.string().trim().max(100).optional(),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: 'Website must start with http:// or https://',
    }),
  description: z.string().trim().max(1000).optional(),
});

export const registerSchema = z.discriminatedUnion('role', [
  developerRegisterSchema,
  businessRegisterSchema,
]);

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
