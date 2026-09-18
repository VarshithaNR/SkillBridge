import { z } from 'zod';

// Mirrors server/src/validators/auth.validator.ts. Kept as a separate,
// hand-written copy rather than a shared package for now — client and
// server are independent packages at this stage of the project — but any
// change to the backend's password/role rules should be reflected here too.
const nameField = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
const emailField = z.string().trim().toLowerCase().email('Enter a valid email address');
const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72)
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[0-9]/, 'Include at least one number');

export const developerRegisterFormSchema = z
  .object({
    role: z.literal('developer'),
    name: nameField,
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    skills: z.array(z.string().trim().min(1)).max(30).default([]),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    bio: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type DeveloperRegisterFormValues = z.infer<typeof developerRegisterFormSchema>;

export const businessRegisterFormSchema = z
  .object({
    role: z.literal('business'),
    name: nameField, // contact name
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    businessName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(150),
    businessType: z.string().trim().max(100).optional(),
    website: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal(''))
      .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
        message: 'Website must start with http:// or https://',
      }),
    description: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type BusinessRegisterFormValues = z.infer<typeof businessRegisterFormSchema>;

export const loginFormSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
