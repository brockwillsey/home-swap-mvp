"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

/**
 * Verify Request Page Content
 *
 * Shown after user submits email for magic link
 * - Displays "check your email" message
 * - Shows the email address (if available from sessionStorage)
 * - Offers resend option after 60 seconds
 */
export function VerifyPageContent() {
  // Get email from sessionStorage (not URL for privacy)
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verify-email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  async function handleResend() {
    if (!email || isResending) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setResendError("Failed to send email. Please try again.");
        return;
      }

      // Reset countdown and show success
      setResendSuccess(true);
      setCanResend(false);
      setCountdown(60);
    } catch (error) {
      console.error("Failed to resend:", error);
      setResendError("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Art Res Branding */}
          <Link href="/" className="mb-4 inline-block">
            <h1 className="text-3xl font-bold text-primary">Art Res</h1>
          </Link>

          {/* Email Icon */}
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

          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="mt-2">
            We&apos;ve sent a magic link to{" "}
            {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              "your email"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              Click the link in the email to sign in to your account.
            </p>
            <p>
              The link will expire in <strong>10 minutes</strong>.
            </p>
          </div>

          {/* Feedback messages */}
          {resendError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
              {resendError}
            </div>
          )}
          {resendSuccess && (
            <div className="rounded-lg bg-green-500/10 p-3 text-center text-sm text-green-700 dark:text-green-400">
              Magic link sent! Check your inbox.
            </div>
          )}

          {/* Didn't receive email? */}
          <div className="text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Didn&apos;t receive the email?
            </p>

            {email ? (
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={!canResend || isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending...
                  </>
                ) : canResend ? (
                  "Resend magic link"
                ) : (
                  `Resend in ${countdown}s`
                )}
              </Button>
            ) : (
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signin">Try again</Link>
              </Button>
            )}
          </div>

          {/* Tips */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Check your spam folder if you don&apos;t see it.</p>
          </div>
        </CardContent>
      </Card>

      {/* Back to sign in */}
      <div className="mt-6">
        <Link
          href="/auth/signin"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to sign in
        </Link>
      </div>
    </main>
  );
}
