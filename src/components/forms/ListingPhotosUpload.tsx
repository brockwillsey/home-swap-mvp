"use client";

import { useState } from "react";
import Image from "next/image";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "~/components/ui/button";
import {
  CLOUDINARY_UPLOAD_PRESET_HOMES,
  CLOUDINARY_FOLDERS,
  isCloudinaryConfigured,
} from "~/lib/services/cloudinary";

export interface ListingPhoto {
  id: string;
  url: string;
  publicId: string;
}

interface ListingPhotosUploadProps {
  photos: ListingPhoto[];
  onChange: (photos: ListingPhoto[]) => void;
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

interface SortablePhotoProps {
  photo: ListingPhoto;
  index: number;
  isPrimary: boolean;
  disabled: boolean;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

/**
 * Sortable Photo Item Component
 */
function SortablePhoto({
  photo,
  index,
  isPrimary,
  disabled,
  onRemove,
  onSetPrimary,
}: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  // Check if it's a Cloudinary URL or external URL
  const isCloudinaryUrl = photo.url.includes("cloudinary.com") || (photo.publicId && !photo.url.startsWith("http"));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-muted ${
        isPrimary ? "border-primary ring-2 ring-primary/20" : "border-transparent"
      } ${isDragging ? "shadow-xl" : ""}`}
    >
      {isCloudinaryUrl && isCloudinaryConfigured() ? (
        <CldImage
          src={photo.url}
          alt={`Listing photo ${index + 1}${isPrimary ? " (cover)" : ""}`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          crop="fill"
          className="object-cover"
        />
      ) : (
        <Image
          src={photo.url}
          alt={`Listing photo ${index + 1}${isPrimary ? " (cover)" : ""}`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
          unoptimized
        />
      )}

      {/* Drag handle overlay */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          aria-label={`Drag to reorder photo ${index + 1}`}
        />
      )}

      {/* Primary badge */}
      {isPrimary && (
        <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          Cover
        </div>
      )}

      {/* Photo number */}
      <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
        {index + 1}
      </div>

      {/* Action buttons (visible on hover) */}
      {!disabled && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {/* Set as primary button */}
          {!isPrimary && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSetPrimary(photo.id);
              }}
              aria-label={`Set photo ${index + 1} as cover`}
            >
              Set Cover
            </Button>
          )}

          {/* Remove button */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(photo.id);
            }}
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
        </div>
      )}
    </div>
  );
}

/**
 * Listing Photos Upload Component
 *
 * Enhanced photo upload with:
 * - Cloudinary direct uploads
 * - Drag-to-reorder functionality
 * - Primary/cover photo selection
 * - Minimum photo validation
 */
export function ListingPhotosUpload({
  photos = [],
  onChange,
  disabled = false,
  minPhotos = 3,
  maxPhotos = 10,
}: ListingPhotosUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // DnD sensors with keyboard support for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const cloudinaryConfigured = isCloudinaryConfigured();

  function handleUploadSuccess(results: CloudinaryUploadWidgetResults) {
    setIsUploading(false);
    setError(null);

    if (results.info && typeof results.info !== "string") {
      const info = results.info as CloudinaryUploadInfo;
      // Add new photo with unique ID
      if (photos.length < maxPhotos) {
        const newPhoto: ListingPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: info.secure_url,
          publicId: info.public_id,
        };
        onChange([...photos, newPhoto]);
      }
    }
  }

  function handleUploadError(error: unknown) {
    setIsUploading(false);
    console.error("[ListingPhotosUpload] Upload failed:", error);
    setError("Upload failed. Please try again.");
  }

  function handleRemove(photoId: string) {
    onChange(photos.filter((p) => p.id !== photoId));
    setError(null);
  }

  function handleSetPrimary(photoId: string) {
    // Move the selected photo to the front
    const photoIndex = photos.findIndex((p) => p.id === photoId);
    if (photoIndex > 0) {
      const newPhotos = [...photos];
      const [photo] = newPhotos.splice(photoIndex, 1);
      newPhotos.unshift(photo!);
      onChange(newPhotos);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      onChange(arrayMove(photos, oldIndex, newIndex));
    }
  }

  const photosRemaining = maxPhotos - photos.length;
  const hasMinimumPhotos = photos.length >= minPhotos;

  return (
    <div className="space-y-4">
      {/* Photo count indicator */}
      <div
        className="flex items-center justify-between text-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className={
            hasMinimumPhotos
              ? "text-green-600 dark:text-green-400"
              : "text-muted-foreground"
          }
        >
          {photos.length} of {minPhotos} required photos
        </span>
        <span className="text-muted-foreground">
          {photos.length}/{maxPhotos} total
        </span>
      </div>

      {/* Instructions */}
      {photos.length > 0 && !disabled && (
        <p className="text-sm text-muted-foreground">
          Drag photos to reorder. First photo is your cover image.
        </p>
      )}

      {/* Photo grid with drag-to-reorder */}
      {photos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {photos.map((photo, index) => (
                <SortablePhoto
                  key={photo.id}
                  photo={photo}
                  index={index}
                  isPrimary={index === 0}
                  disabled={disabled}
                  onRemove={handleRemove}
                  onSetPrimary={handleSetPrimary}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Add photos of your home
          </p>
          <p className="text-xs text-muted-foreground/70">
            Minimum {minPhotos} photos required. First photo will be your cover.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Upload button - only show if Cloudinary is configured */}
      {photos.length < maxPhotos && cloudinaryConfigured && (
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
              variant={photos.length > 0 ? "outline" : "default"}
              className="w-full"
              disabled={disabled || isUploading}
              onClick={() => open()}
            >
              {isUploading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading...
                </>
              ) : photos.length > 0 ? (
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
                  Upload photos
                </>
              )}
            </Button>
          )}
        </CldUploadWidget>
      )}

      {/* Cloudinary not configured message */}
      {photos.length < maxPhotos && !cloudinaryConfigured && (
        <div className="rounded-lg border border-dashed border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Photo uploads require Cloudinary configuration. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to enable uploads.
          </p>
        </div>
      )}

      {/* Max photos reached */}
      {photos.length >= maxPhotos && (
        <p className="text-center text-sm text-muted-foreground">
          Maximum {maxPhotos} photos reached. Remove photos to add new ones.
        </p>
      )}
    </div>
  );
}
