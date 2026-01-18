import { Suspense } from "react";
import Link from "next/link";

import { ApplicationForm } from "~/components/forms/ApplicationForm";

/**
 * Membership Application Page
 *
 * Public page where visitors can apply to join Art Res.
 * No authentication required.
 */
export default function ApplyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Art Res Branding */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-bold text-primary">Art Res</h1>
        </Link>
        <p className="mt-2 text-muted-foreground">
          Home exchange for creative people
        </p>
      </div>

      {/* Application Form with Suspense boundary for client hooks */}
      <Suspense
        fallback={
          <div className="flex h-64 w-full max-w-2xl items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <ApplicationForm />
      </Suspense>

      {/* Back to home link */}
      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to home
        </Link>
      </div>
    </main>
  );
}
