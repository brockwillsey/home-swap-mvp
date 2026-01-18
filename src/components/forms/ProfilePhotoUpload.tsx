"use client";

import { useState } from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";

import { Button } from "~/components/ui/button";
import { CLOUDINARY_UPLOAD_PRESET_PROFILES, isCloudinaryConfigured } from "~/lib/services/cloudinary";

interface ProfilePhotoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

interface CloudinaryUploadInfo {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

/**
 * Profile Photo Upload Component
 *
 * Uses Cloudinary's upload widget for direct browser uploads.
 * Shows upload button when no photo, preview when uploaded.
 * Returns the Cloudinary secure URL to parent form.
 */
export function ProfilePhotoUpload({
  value,
  onChange,
  disabled = false,
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured()) {
    return (
      <div className="rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment.
        </p>
      </div>
    );
  }

  function handleUploadSuccess(results: CloudinaryUploadWidgetResults) {
    setIsUploading(false);
    setError(null);

    if (results.info && typeof results.info !== "string") {
      const info = results.info as CloudinaryUploadInfo;
      onChange(info.secure_url);
    }
  }

  function handleUploadError(error: unknown) {
    setIsUploading(false);
    // Log actual error for debugging
    console.error("[ProfilePhotoUpload] Upload failed:", error);
    setError("Upload failed. Please try again.");
  }

  function handleRemove() {
    onChange("");
    setError(null);
  }

  return (
    <div className="space-y-4">
      {/* Preview area */}
      {value ? (
        <div className="relative mx-auto w-fit">
          <div className="overflow-hidden rounded-full border-4 border-primary/20">
            <CldImage
              src={value}
              alt="Profile photo preview"
              width={150}
              height={150}
              crop="fill"
              gravity="face"
              className="h-[150px] w-[150px] object-cover"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full p-0"
              onClick={handleRemove}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="sr-only">Remove photo</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8">
          {/* Upload icon */}
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Upload your profile photo
          </p>
          <p className="text-xs text-muted-foreground/70">
            JPG, PNG or WebP (max 10MB)
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      {/* Upload button */}
      <CldUploadWidget
        uploadPreset={CLOUDINARY_UPLOAD_PRESET_PROFILES}
        options={{
          maxFiles: 1,
          maxFileSize: 10485760, // 10MB
          sources: ["local", "camera"],
          resourceType: "image",
          cropping: true,
          croppingAspectRatio: 1,
          croppingShowDimensions: true,
          showSkipCropButton: false,
          folder: "art-res/profiles",
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
            variant={value ? "outline" : "default"}
            className="w-full"
            disabled={disabled || isUploading}
            onClick={() => open()}
          >
            {isUploading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Uploading...
              </>
            ) : value ? (
              "Change photo"
            ) : (
              "Upload photo"
            )}
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}
