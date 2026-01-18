"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ListingPhotosUpload, type ListingPhoto } from "~/components/forms/ListingPhotosUpload";
import { api } from "~/trpc/react";

interface ListingPhotosFormProps {
  listingId: string;
  listingTitle: string;
  initialPhotos: string[];
}

/**
 * Listing Photos Form
 *
 * Client component for uploading and managing listing photos.
 * Handles auto-save on changes and publish with validation.
 */
export function ListingPhotosForm({
  listingId,
  listingTitle,
  initialPhotos,
}: ListingPhotosFormProps) {
  const router = useRouter();

  // Convert URL strings to ListingPhoto objects
  const [photos, setPhotos] = useState<ListingPhoto[]>(() =>
    initialPhotos.map((url, index) => ({
      id: `existing-${index}-${Date.now()}`,
      url,
      publicId: "", // We don't have publicId for existing photos
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updatePhotos = api.listing.updatePhotos.useMutation({
    onSuccess: () => {
      setHasUnsavedChanges(false);
      toast.success("Photos saved");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const publishListing = api.listing.publish.useMutation({
    onSuccess: () => {
      toast.success("Listing published!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Auto-save photos when they change (debounced)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      updatePhotos.mutate({
        id: listingId,
        photos: photos.map((p) => p.url),
      });
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [photos, hasUnsavedChanges, listingId, updatePhotos]);

  function handlePhotosChange(newPhotos: ListingPhoto[]) {
    setPhotos(newPhotos);
    setHasUnsavedChanges(true);
  }

  async function handleSave() {
    setIsSaving(true);
    updatePhotos.mutate({
      id: listingId,
      photos: photos.map((p) => p.url),
    });
  }

  async function handlePublish() {
    // Save first if there are unsaved changes
    if (hasUnsavedChanges) {
      await new Promise<void>((resolve) => {
        updatePhotos.mutate(
          {
            id: listingId,
            photos: photos.map((p) => p.url),
          },
          {
            onSuccess: () => resolve(),
            onError: () => resolve(),
          }
        );
      });
    }

    // Then publish
    publishListing.mutate({ id: listingId });
  }

  const canPublish = photos.length >= 3;
  const isPublishing = publishListing.isPending;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Add Photos</CardTitle>
        <CardDescription>
          Upload at least 3 photos of your home. Drag to reorder - the first photo will be your cover image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ListingPhotosUpload
          photos={photos}
          onChange={handlePhotosChange}
          disabled={isPublishing}
          minPhotos={3}
          maxPhotos={10}
        />

        {/* Status indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : hasUnsavedChanges ? (
              "Unsaved changes"
            ) : (
              "All changes saved"
            )}
          </span>
        </div>

        {/* Validation message */}
        {!canPublish && photos.length > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Add {3 - photos.length} more photo{3 - photos.length > 1 ? "s" : ""} to publish your listing.
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isPublishing}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isPublishing || !hasUnsavedChanges}
          >
            {isSaving ? "Saving..." : "Save Photos"}
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish || isPublishing}
          >
            {isPublishing ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Publishing...
              </>
            ) : (
              "Publish Listing"
            )}
          </Button>
        </div>

        {/* Info text */}
        <p className="text-sm text-muted-foreground">
          Your listing for &quot;{listingTitle}&quot; will be visible to other members once published.
        </p>
      </CardContent>
    </Card>
  );
}
