import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

/**
 * Admin Layout
 *
 * Wraps all admin pages with authentication and navigation.
 * Redirects non-admins to dashboard.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  // Check if user is admin
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-2xl font-bold text-primary">
              Art Res Admin
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/applications"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Applications
              </Link>
              <Link
                href="/admin/members"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Members
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name ?? "Admin"}
            </span>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Exit Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
