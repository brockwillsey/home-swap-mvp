import { Suspense } from "react";

import { SignInPageContent } from "./SignInPageContent";

/**
 * Sign-In Page
 *
 * Magic link authentication form for Musa Residency
 * Uses Suspense boundary for useSearchParams (Next.js 15 requirement)
 */
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}
