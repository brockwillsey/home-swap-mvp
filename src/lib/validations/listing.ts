/**
 * Listing Validation Schemas
 *
 * Zod schemas for home listing form validation.
 * Used by both client forms and server tRPC procedures.
 */

import { z } from "zod";

/**
 * Schema for creating a new listing (basic info only)
 * Photos, availability, and settings are added in subsequent stories
 */
export const createListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be 2000 characters or less"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location must be 200 characters or less"),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

/**
 * Schema for updating a listing's basic info
 */
export const updateListingSchema = createListingSchema.partial().extend({
  id: z.string().min(1, "Listing ID is required"),
});

export type UpdateListingInput = z.infer<typeof updateListingSchema>;
