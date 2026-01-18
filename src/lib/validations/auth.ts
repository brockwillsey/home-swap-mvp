/**
 * Authentication Validation Schemas
 *
 * Zod schemas for auth-related forms and data validation.
 * Per architecture: "Use Zod schemas from `lib/validations/` - no inline schemas"
 */

import { z } from "zod";

/**
 * Email validation schema for sign-in form
 * Used by the magic link authentication flow
 * Normalizes email to lowercase and trims whitespace
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .transform((email) => email.trim().toLowerCase());

/**
 * Sign-in form schema
 * Contains just email for magic link auth
 */
export const signInSchema = z.object({
  email: emailSchema,
});

/**
 * Type for sign-in form data
 */
export type SignInFormData = z.infer<typeof signInSchema>;
