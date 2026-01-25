"use client";

import Image from "next/image";
import { CldImage } from "next-cloudinary";

interface ListingImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Smart image component that handles both Cloudinary and external URLs
 */
export function ListingImage({ src, alt, fill, sizes, className }: ListingImageProps) {
  // Check if it's a Cloudinary URL or public ID
  const isCloudinary = src.includes("cloudinary.com") || !src.startsWith("http");

  if (isCloudinary && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    return (
      <CldImage
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        crop="fill"
        className={className}
      />
    );
  }

  // Fallback to regular Next.js Image for external URLs
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      unoptimized
    />
  );
}
