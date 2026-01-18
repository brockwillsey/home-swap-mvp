"use client";

import { signOut } from "next-auth/react";

import { Button } from "~/components/ui/button";

interface SignOutButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * Sign Out Button Component
 *
 * Uses next-auth signOut with POST request for proper CSRF protection.
 * Redirects to home page after sign out.
 */
export function SignOutButton({
  variant = "outline",
  size = "sm",
  className,
}: SignOutButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
}
