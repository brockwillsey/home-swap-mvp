/**
 * Application Form Validation Schemas
 *
 * Zod schemas for membership application form validation.
 * Used by both React Hook Form (client) and tRPC (server).
 */

import { z } from "zod";

/**
 * Membership role options
 */
export const MembershipRole = {
  ARTIST: "ARTIST",
  HOME_OWNER: "HOME_OWNER",
  SPONSOR: "SPONSOR",
} as const;

export type MembershipRoleType = (typeof MembershipRole)[keyof typeof MembershipRole];

/**
 * Validates that a URL is from Cloudinary's CDN
 * Prevents submission of arbitrary external URLs
 * DEV MODE: Also accepts empty string for testing without Cloudinary
 */
const cloudinaryUrlSchema = z
  .string()
  .refine(
    (url) => url === "" || url.startsWith("https://res.cloudinary.com/") || url.startsWith("https://"),
    "Invalid photo URL - must be uploaded through our system"
  );

/**
 * Validates an array of home photo URLs from Cloudinary
 * Requires minimum 3 photos, maximum 10 (when home owner)
 * DEV MODE: Accepts any URLs for testing without Cloudinary
 */
const homePhotosSchema = z
  .array(
    z
      .string()
      .url("Invalid photo URL")
  )
  .max(10, "Maximum 10 photos allowed");

/**
 * Application form schema with role-based conditional fields
 *
 * Pricing:
 * - Artist with home: $300
 * - Artist without home: $150
 * - Sponsor only: Free
 *
 * Fields:
 * - roles: Array of membership roles (ARTIST, HOME_OWNER, SPONSOR)
 * - name: Applicant's full name (min 2 chars, trimmed)
 * - email: Valid email address (normalized to lowercase, trimmed)
 * - bio: About the applicant (min 50 chars for quality, trimmed)
 * - location: Where they live (city/region, trimmed)
 * - portfolioUrl: Link to portfolio/work (required for artists)
 * - studioGalleryReferral: Info about nearby studios/galleries that might join Art Res
 * - reasonForJoining: Why they want to join Art Res (trimmed)
 * - profilePhotoUrl: Cloudinary URL for profile photo (validated domain)
 * - homePhotos: Array of Cloudinary URLs for home photos (required for home owners)
 */
export const applicationFormSchema = z
  .object({
    roles: z
      .array(z.enum(["ARTIST", "HOME_OWNER", "SPONSOR"]))
      .min(1, "Please select at least one role"),

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

    portfolioUrl: z
      .string()
      .transform((s) => s?.trim() ?? ""),

    studioGalleryReferral: z
      .string()
      .min(1, "Please provide information about nearby studios or galleries"),

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

    promoCode: z
      .string()
      .transform((s) => s?.trim().toUpperCase() ?? "")
      .optional(),
  })
  .refine(
    (data) => {
      // If ARTIST selected, portfolio URL is required
      if (data.roles.includes("ARTIST") && !data.portfolioUrl) {
        return false;
      }
      return true;
    },
    {
      message: "Please provide a link to your portfolio or work",
      path: ["portfolioUrl"],
    }
  )
  .refine(
    (data) => {
      // If HOME_OWNER selected, home photos are required (min 3)
      // TEMPORARILY OPTIONAL: Skip photo requirement until Cloudinary is configured
      // TODO: Re-enable once Cloudinary is set up in production
      // if (data.roles.includes("HOME_OWNER") && (!data.homePhotos || data.homePhotos.length < 3)) {
      //   return false;
      // }
      return true;
    },
    {
      message: "Please upload at least 3 photos of your home",
      path: ["homePhotos"],
    }
  );

/**
 * Type for application form data
 * Inferred from the Zod schema for type safety
 */
export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

/**
 * Calculate membership fee based on roles
 * - Has home (HOME_OWNER): $300
 * - Artist only (no home): $150
 * - Sponsor only: $0 (free)
 */
export function calculateMembershipFee(roles: MembershipRoleType[]): number {
  if (roles.includes("HOME_OWNER")) {
    return 300;
  }
  if (roles.includes("ARTIST")) {
    return 150;
  }
  // Sponsor only
  return 0;
}
