import Link from "next/link";

import { SignOutButton } from "~/components/auth/SignOutButton";
import { PointsBalanceDisplay } from "~/components/points/PointsBalanceDisplay";

interface MemberHeaderProps {
  /** Optional user name to display */
  userName?: string | null;
  /** User's points balance */
  userPoints?: number;
  /** Unread message count */
  unreadMessages?: number;
  /** Active page for highlighting */
  activePage?: "dashboard" | "profile" | "members" | "search" | "trips" | "points" | "messages";
}

/**
 * Shared header component for member pages
 *
 * Displays the Musa Residency logo, navigation links, and sign out button.
 */
export function MemberHeader({ userName, userPoints, unreadMessages, activePage }: MemberHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          Musa Residency
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className={`text-sm ${
              activePage === "search"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Search
          </Link>
          <Link
            href="/trips"
            className={`text-sm ${
              activePage === "trips"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Trips
          </Link>
          <Link
            href="/messages"
            className={`relative text-sm ${
              activePage === "messages"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Messages
            {unreadMessages !== undefined && unreadMessages > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>
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
          {userPoints !== undefined && (
            <PointsBalanceDisplay points={userPoints} compact />
          )}
          {userName && (
            <span className="text-sm text-muted-foreground">{userName}</span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
