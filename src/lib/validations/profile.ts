/**
 * Profile Validation Schema
 *
 * Validates member profile data for view and edit operations.
 * Reuses constraints from application validation where appropriate.
 */

import { z } from "zod";

/**
 * Profile update schema - all fields optional since partial updates are allowed
 */
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),

  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters")
    .max(1000, "Bio must be less than 1000 characters")
    .optional(),

  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters")
    .optional(),

  creativeInterests: z
    .string()
    .min(20, "Creative interests must be at least 20 characters")
    .max(500, "Creative interests must be less than 500 characters")
    .optional(),

  image: z
    .string()
    .url("Profile photo must be a valid URL")
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.hostname === "res.cloudinary.com";
        } catch {
          return false;
        }
      },
      { message: "Profile photo must be hosted on Cloudinary" }
    )
    .optional()
    .nullable(),
});

/**
 * Profile data schema - represents the full profile structure
 */
export const profileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  creativeInterests: z.string().nullable(),
  createdAt: z.date(),
  points: z.number(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
