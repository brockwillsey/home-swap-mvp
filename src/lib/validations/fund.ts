/**
 * Fund Validation Schemas
 *
 * Zod schemas for crowdfunding form validation.
 * Used by both client forms and server tRPC procedures.
 */

import { z } from "zod";

/**
 * Schema for creating a new fund
 */
export const createFundSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be 5000 characters or less"),
  goalAmount: z
    .number()
    .min(10000, "Minimum goal is $100")
    .max(100000000, "Maximum goal is $1,000,000"),
  homeId: z.string().optional(),
  coverImage: z.string().url("Must be a valid URL").optional(),
});

export type CreateFundInput = z.infer<typeof createFundSchema>;

/**
 * Schema for updating a fund
 */
export const updateFundSchema = createFundSchema.partial().extend({
  id: z.string().min(1, "Fund ID is required"),
});

export type UpdateFundInput = z.infer<typeof updateFundSchema>;

/**
 * Schema for donation input
 */
export const donationInputSchema = z.object({
  fundId: z.string().min(1, "Fund ID is required"),
  amount: z
    .number()
    .min(500, "Minimum donation is $5")
    .max(100000000, "Maximum donation is $1,000,000"),
  message: z
    .string()
    .max(500, "Message must be 500 characters or less")
    .optional(),
  isAnonymous: z.boolean().default(false),
});

export type DonationInput = z.infer<typeof donationInputSchema>;
