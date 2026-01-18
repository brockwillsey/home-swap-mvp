import Link from "next/link";

import { SignOutButton } from "~/components/auth/SignOutButton";

interface MemberHeaderProps {
  /** Optional user name to display */
  userName?: string | null;
  /** Active page for highlighting */
  activePage?: "dashboard" | "profile" | "members";
}

/**
 * Shared header component for member pages
 *
 * Displays the Art Res logo, navigation links, and sign out button.
 */
export function MemberHeader({ userName, activePage }: MemberHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          Art Res
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/members"
            className={`text-sm ${
              activePage === "members"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Members
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm ${
              activePage === "dashboard"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className={`text-sm ${
              activePage === "profile"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Profile
          </Link>
          {userName && (
            <span className="text-sm text-muted-foreground">{userName}</span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
