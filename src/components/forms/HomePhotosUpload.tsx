"use client";

import { useState } from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";

import { Button } from "~/components/ui/button";
import { CLOUDINARY_UPLOAD_PRESET_HOMES, CLOUDINARY_FOLDERS, isCloudinaryConfigured } from "~/lib/services/cloudinary";

interface HomePhotosUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  minPhotos?: number;
  maxPhotos?: number;
}

interface CloudinaryUploadInfo {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

/**
 * Home Photos Upload Component
 *
 * Uses Cloudinary's upload widget for direct browser uploads.
 * Supports multiple photo uploads with grid preview.
 * Returns array of Cloudinary secure URLs to parent form.
 */
export function HomePhotosUpload({
  value = [],
  onChange,
  disabled = false,
  minPhotos = 3,
  maxPhotos = 10,
}: HomePhotosUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured()) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Photo upload is temporarily unavailable. You can continue without photos.
        </p>
      </div>
    );
  }

  function handleUploadSuccess(results: CloudinaryUploadWidgetResults) {
    setIsUploading(false);
    setError(null);

    if (results.info && typeof results.info !== "string") {
      const info = results.info as CloudinaryUploadInfo;
      // Add new photo URL to the array (don't exceed max)
      if (value.length < maxPhotos) {
        onChange([...value, info.secure_url]);
      }
    }
  }

  function handleUploadError(error: unknown) {
    setIsUploading(false);
    // Log actual error for debugging
    console.error("[HomePhotosUpload] Upload failed:", error);
    setError("Upload failed. Please try again.");
  }

  function handleRemove(indexToRemove: number) {
    onChange(value.filter((_, index) => index !== indexToRemove));
    setError(null);
  }

  const photosRemaining = maxPhotos - value.length;
  const hasMinimumPhotos = value.length >= minPhotos;

  return (
    <div className="space-y-4">
      {/* Photo count indicator - aria-live for screen reader announcements */}
      <div className="flex items-center justify-between text-sm" aria-live="polite" aria-atomic="true">
        <span className={hasMinimumPhotos ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
          {value.length} of {minPhotos} required photos
        </span>
        <span className="text-muted-foreground">
          {value.length}/{maxPhotos} total
        </span>
      </div>

      {/* Photo grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {value.map((url, index) => (
            <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
              <CldImage
                src={url}
                alt={`Home photo ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                crop="fill"
                className="object-cover transition-transform group-hover:scale-105"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full p-0 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              )}
              {/* Photo number badge */}
              <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state / Upload area */}
      {value.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8">
          {/* Home icon */}
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Upload photos of your home
          </p>
          <p className="text-xs text-muted-foreground/70">
            Minimum {minPhotos} photos required • JPG, PNG or WebP (max 10MB each)
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      {/* Upload button */}
      {value.length < maxPhotos && (
        <CldUploadWidget
          uploadPreset={CLOUDINARY_UPLOAD_PRESET_HOMES}
          options={{
            maxFiles: photosRemaining,
            maxFileSize: 10485760, // 10MB
            sources: ["local", "camera"],
            resourceType: "image",
            multiple: true,
            folder: CLOUDINARY_FOLDERS.homes,
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          }}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          onOpen={() => setIsUploading(true)}
          onClose={() => setIsUploading(false)}
        >
          {({ open }) => (
            <Button
              type="button"
              variant={value.length > 0 ? "outline" : "default"}
              className="w-full"
              disabled={disabled || isUploading}
              onClick={() => open()}
            >
              {isUploading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading...
                </>
              ) : value.length > 0 ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add more photos ({photosRemaining} remaining)
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Upload home photos
                </>
              )}
            </Button>
          )}
        </CldUploadWidget>
      )}

      {/* Max photos reached message */}
      {value.length >= maxPhotos && (
        <p className="text-center text-sm text-muted-foreground">
          Maximum {maxPhotos} photos reached. Remove photos to add new ones.
        </p>
      )}
    </div>
  );
}
