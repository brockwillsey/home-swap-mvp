import { Suspense } from "react";

import { ErrorPageContent } from "./ErrorPageContent";

/**
 * Auth Error Page
 *
 * Handles authentication errors including:
 * - Expired magic links (AC #3)
 * - Invalid tokens
 * - Account linking errors
 * - General authentication failures
 *
 * Uses Suspense boundary for useSearchParams (Next.js 15 requirement)
 */
export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      }
    >
      <ErrorPageContent />
    </Suspense>
  );
}
