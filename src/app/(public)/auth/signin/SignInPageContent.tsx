"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { signInSchema, type SignInFormData } from "~/lib/validations/auth";

/**
 * Sign-In Page Content
 *
 * Magic link authentication form for Art Res
 * - Enter email address
 * - Receive magic link via Resend
 * - Redirects to /auth/verify after submission
 */
export function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const error = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: SignInFormData) {
    setIsLoading(true);

    try {
      const result = await signIn("resend", {
        email: data.email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        form.setError("email", {
          type: "manual",
          message: "Failed to send magic link. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      // Store email in sessionStorage (not exposed in URL/history)
      sessionStorage.setItem("verify-email", data.email);

      // Redirect to verify page
      router.push("/auth/verify");
    } catch {
      form.setError("email", {
        type: "manual",
        message: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email to sign in with a magic link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error message from NextAuth */}
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error === "OAuthAccountNotLinked"
                ? "This email is already associated with another account."
                : error === "Verification"
                  ? "The magic link has expired or is invalid."
                  : "An error occurred during sign in."}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending link...
                  </>
                ) : (
                  "Send magic link"
                )}
              </Button>
            </form>
          </Form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href="/apply"
                className="font-medium text-primary hover:underline"
              >
                Apply for membership
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
