/**
 * Cloudinary Service Configuration
 *
 * Provides constants and utilities for Cloudinary image uploads.
 * Uses next-cloudinary for direct browser uploads via CldUploadWidget.
 *
 * Setup Instructions:
 * 1. Create account at https://cloudinary.com
 * 2. Get Cloud Name from Dashboard
 * 3. Create upload preset: Settings → Upload → Upload presets
 *    - Name: "art_res_profiles" (unsigned)
 *    - Folder: "art-res/profiles"
 *    - Transformations: auto quality, auto format, max 1000x1000
 * 4. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env
 */

import { env } from "~/env";

/**
 * Upload preset for profile photos
 * Must be created in Cloudinary dashboard as "unsigned" preset
 */
export const CLOUDINARY_UPLOAD_PRESET_PROFILES = "art_res_profiles";

/**
 * Upload preset for home listing photos
 * Must be created in Cloudinary dashboard as "unsigned" preset
 */
export const CLOUDINARY_UPLOAD_PRESET_HOMES = "art_res_homes";

/**
 * Cloudinary cloud name from environment
 * Used by next-cloudinary CldUploadWidget and CldImage
 */
export const CLOUDINARY_CLOUD_NAME = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/**
 * Check if Cloudinary is properly configured
 * Returns false if cloud name is missing
 */
export function isCloudinaryConfigured(): boolean {
  return !!env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

/**
 * Cloudinary upload folder paths
 */
export const CLOUDINARY_FOLDERS = {
  profiles: "art-res/profiles",
  homes: "art-res/homes",
} as const;

/**
 * Default image transformations for optimized delivery
 */
export const CLOUDINARY_TRANSFORMATIONS = {
  profileThumbnail: {
    width: 150,
    height: 150,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
  },
  profileMedium: {
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
  },
  homeThumbnail: {
    width: 400,
    height: 300,
    crop: "fill",
    quality: "auto",
    format: "auto",
  },
  homeGallery: {
    width: 1200,
    height: 800,
    crop: "fill",
    quality: "auto",
    format: "auto",
  },
} as const;
