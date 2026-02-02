"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasUserInteraction, setHasUserInteraction] = useState(false);

  // Get the callback URL and token from the intermediate link
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Detect real user interaction (not a bot/scanner)
  useEffect(() => {
    const handleInteraction = () => {
      setHasUserInteraction(true);
    };

    // Listen for user interactions
    window.addEventListener("mousemove", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  const handleSignIn = () => {
    if (!token || !email) {
      router.push("/auth/error?error=Verification");
      return;
    }

    setIsVerifying(true);

    // Construct the actual verification URL
    const verifyUrl = `/api/auth/callback/resend?callbackUrl=${encodeURIComponent(callbackUrl)}&token=${token}&email=${encodeURIComponent(email)}`;

    // Navigate to the verification endpoint
    window.location.href = verifyUrl;
  };

  if (!token || !email) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="mb-4 inline-block">
              <h1 className="text-3xl font-bold text-primary">Art Res</h1>
            </Link>
            <CardTitle className="text-2xl text-destructive">Invalid Link</CardTitle>
            <CardDescription className="mt-2">
              This magic link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Request a new link</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-block">
            <h1 className="text-3xl font-bold text-primary">Art Res</h1>
          </Link>

          {/* Success Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <CardTitle className="text-2xl">Welcome back!</CardTitle>
          <CardDescription className="mt-2">
            Click the button below to sign in to your Art Res account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={handleSignIn}
            disabled={isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in to Art Res"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Signing in as <span className="font-medium">{email}</span>
          </p>
        </CardContent>
      </Card>

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

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}
