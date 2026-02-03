"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

// Default error info for unknown error codes
const DEFAULT_ERROR = {
  title: "Authentication error",
  description:
    "An unexpected error occurred during authentication. Please try again.",
} as const;

// Error messages mapped from NextAuth error codes
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Verification: {
    title: "Link expired or invalid",
    description:
      "The magic link you clicked has expired or is no longer valid. Magic links expire after 10 minutes for security.",
  },
  AccessDenied: {
    title: "Access denied",
    description:
      "You don't have permission to access this resource. Please contact support if you believe this is an error.",
  },
  Configuration: {
    title: "Server configuration error",
    description:
      "There's a problem with the server configuration. Please try again later or contact support.",
  },
  OAuthAccountNotLinked: {
    title: "Account already exists",
    description:
      "This email is already associated with a different sign-in method. Please sign in using your original method.",
  },
  Default: DEFAULT_ERROR,
};

export function ErrorPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";

  const errorInfo = ERROR_MESSAGES[error] ?? DEFAULT_ERROR;
  const { title, description } = errorInfo;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Musa Residency Branding */}
          <Link href="/" className="mb-4 inline-block">
            <h1 className="text-3xl font-bold text-primary">Musa Residency</h1>
          </Link>

          {/* Error Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <CardTitle className="text-2xl text-destructive">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Request new link button - primary action for expired links */}
          <Button asChild className="w-full">
            <Link href="/auth/signin">Request a new link</Link>
          </Button>

          {/* Help text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help?{" "}
              <Link
                href="/"
                className="font-medium text-primary hover:underline"
              >
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Back to home */}
      <div className="mt-6">
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
