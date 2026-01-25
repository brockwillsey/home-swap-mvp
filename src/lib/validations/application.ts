/**
 * Application Form Validation Schemas
 *
 * Zod schemas for membership application form validation.
 * Used by both React Hook Form (client) and tRPC (server).
 */

import { z } from "zod";

/**
 * Validates that a URL is from Cloudinary's CDN
 * Prevents submission of arbitrary external URLs
 */
const cloudinaryUrlSchema = z
  .string()
  .url("Please upload a profile photo")
  .refine(
    (url) => url.startsWith("https://res.cloudinary.com/"),
    "Invalid photo URL - must be uploaded through our system"
  );

/**
 * Validates an array of home photo URLs from Cloudinary
 * Requires minimum 3 photos, maximum 10
 */
const homePhotosSchema = z
  .array(
    z
      .string()
      .url("Invalid photo URL")
      .refine(
        (url) => url.startsWith("https://res.cloudinary.com/"),
        "Invalid photo URL - must be uploaded through our system"
      )
  )
  .min(3, "Please upload at least 3 photos of your home")
  .max(10, "Maximum 10 photos allowed");

/**
 * Application form schema with all required fields
 *
 * Fields:
 * - name: Applicant's full name (min 2 chars, trimmed)
 * - email: Valid email address (normalized to lowercase, trimmed)
 * - bio: About the applicant (min 50 chars for quality, trimmed)
 * - location: Where they live (city/region, trimmed)
 * - creativeInterests: Membership roles stored as comma-separated string
 * - reasonForJoining: Why they want to join Art Res (trimmed)
 * - profilePhotoUrl: Cloudinary URL for profile photo (validated domain)
 * - homePhotos: Array of Cloudinary URLs for home photos (min 3, max 10, validated domain)
 */
export const applicationFormSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
    ),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.trim().toLowerCase()),

  bio: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(50, "Please tell us more about yourself (at least 50 characters)")
        .max(1000, "Bio must be less than 1000 characters")
    ),

  location: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(2, "Please enter your location")
        .max(200, "Location must be less than 200 characters")
    ),

  creativeInterests: z
    .array(z.enum(["HOME_OWNER", "ARTIST", "ARTIST_SPONSOR"]))
    .min(1, "Please select at least one membership role"),

  reasonForJoining: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(20, "Please tell us why you want to join (at least 20 characters)")
        .max(1000, "Reason must be less than 1000 characters")
    ),

  profilePhotoUrl: cloudinaryUrlSchema,

  homePhotos: homePhotosSchema,
});

/**
 * Type for application form data
 * Inferred from the Zod schema for type safety
 */
export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
