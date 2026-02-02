import Link from "next/link";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

interface FundCardProps {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  coverImage: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  donationCount: number;
  isOwner?: boolean;
}

/**
 * Format cents to dollars
 */
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Fund Card Component
 *
 * Displays a fundraising campaign in a card format for browse pages.
 * Shows cover image, title, progress, and creator info.
 */
export function FundCard({
  id,
  title,
  description,
  goalAmount,
  currentAmount,
  coverImage,
  status,
  creator,
  donationCount,
  isOwner = false,
}: FundCardProps) {
  const progressPercent = Math.min((currentAmount / goalAmount) * 100, 100);
  const href = isOwner ? `/funds/${id}/edit` : `/funds/${id}`;

  return (
    <Link href={href} className="block">
      <Card className="h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
        {/* Cover Image */}
        <div className="relative aspect-video bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <svg
                className="h-12 w-12 text-primary/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          )}

          {/* Status Badge (for owner view) */}
          {isOwner && status !== "ACTIVE" && (
            <div className="absolute left-2 top-2">
              <div
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  status === "DRAFT"
                    ? "bg-yellow-500/90 text-white"
                    : status === "PAUSED"
                    ? "bg-orange-500/90 text-white"
                    : status === "COMPLETED"
                    ? "bg-green-500/90 text-white"
                    : "bg-gray-500/90 text-white"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </div>
            </div>
          )}

          {/* Donation Count */}
          {donationCount > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              {donationCount}
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Progress Bar */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-primary">
                  {formatCurrency(currentAmount)}
                </span>
                <span className="text-muted-foreground">
                  of {formatCurrency(goalAmount)} goal
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {progressPercent.toFixed(0)}% funded
              </p>
            </div>

            {/* Creator info */}
            <div className="flex items-center gap-2 border-t pt-3">
              {creator.image ? (
                <Image
                  src={creator.image}
                  alt={creator.name ?? "Creator"}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {creator.name?.charAt(0) ?? "?"}
                </div>
              )}
              <span className="text-sm text-muted-foreground">
                by {creator.name ?? "Member"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
