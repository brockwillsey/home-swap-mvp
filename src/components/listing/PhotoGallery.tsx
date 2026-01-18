"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

import { Button } from "~/components/ui/button";

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

/**
 * Photo Gallery Component
 *
 * Displays listing photos in a grid with lightbox functionality.
 */
export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-muted">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-muted-foreground">No photos available</p>
        </div>
      </div>
    );
  }

  function openLightbox(index: number) {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }

  function goToPrevious() {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function goToNext() {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  // Handle keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    }
  }

  return (
    <>
      {/* Photo Grid */}
      <div className="grid gap-2 overflow-hidden rounded-xl">
        {photos.length === 1 ? (
          // Single photo - full width
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="relative aspect-[16/9] overflow-hidden"
          >
            <CldImage
              src={photos[0]!}
              alt={title}
              fill
              sizes="100vw"
              crop="fill"
              className="object-cover transition-transform hover:scale-105"
            />
          </button>
        ) : photos.length === 2 ? (
          // Two photos - side by side
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => openLightbox(index)}
                className="relative aspect-[4/3] overflow-hidden"
              >
                <CldImage
                  src={photo}
                  alt={`${title} - Photo ${index + 1}`}
                  fill
                  sizes="50vw"
                  crop="fill"
                  className="object-cover transition-transform hover:scale-105"
                />
              </button>
            ))}
          </div>
        ) : (
          // 3+ photos - hero with grid
          <div className="grid gap-2 md:grid-cols-2">
            {/* Hero image */}
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="relative aspect-[4/3] overflow-hidden md:row-span-2"
            >
              <CldImage
                src={photos[0]!}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                crop="fill"
                className="object-cover transition-transform hover:scale-105"
              />
            </button>

            {/* Secondary images */}
            <div className="grid grid-cols-2 gap-2">
              {photos.slice(1, 5).map((photo, index) => (
                <button
                  key={index + 1}
                  type="button"
                  onClick={() => openLightbox(index + 1)}
                  className="relative aspect-[4/3] overflow-hidden"
                >
                  <CldImage
                    src={photo}
                    alt={`${title} - Photo ${index + 2}`}
                    fill
                    sizes="25vw"
                    crop="fill"
                    className="object-cover transition-transform hover:scale-105"
                  />
                  {/* Show "View all" overlay on last visible photo if more exist */}
                  {index === 3 && photos.length > 5 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-lg font-medium text-white">
                        +{photos.length - 5} more
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View All Button */}
      {photos.length > 1 && (
        <div className="mt-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openLightbox(0)}
          >
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
            View all {photos.length} photos
          </Button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Main image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <CldImage
              src={photos[currentIndex]!}
              alt={`${title} - Photo ${currentIndex + 1}`}
              width={1200}
              height={800}
              crop="fit"
              className="max-h-[90vh] w-auto"
            />
          </div>

          {/* Next button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
