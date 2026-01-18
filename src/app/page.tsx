import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { SignOutButton } from "~/components/auth/SignOutButton";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {/* Art Res Logo/Title */}
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
              Art Res
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Creative Home Exchange Community
            </p>
          </div>

          {/* Value Proposition */}
          <div className="grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 shadow-md">
              <h3 className="text-lg font-semibold text-primary">
                Curated Community
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Join a trusted network of creative professionals and
                experience-seekers.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-md">
              <h3 className="text-lg font-semibold text-accent-foreground">
                Easy Exchange
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Book directly without endless messaging. Swap homes or use
                points.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-md">
              <h3 className="text-lg font-semibold text-primary">
                Beautiful Homes
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Stay in thoughtfully designed spaces in creative cities
                worldwide.
              </p>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex flex-col items-center gap-4">
            {session ? (
              <>
                <p className="text-lg text-foreground">
                  Welcome back, {session.user?.name ?? session.user?.email}!
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/dashboard"
                    className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    Go to Dashboard
                  </Link>
                  <SignOutButton
                    variant="secondary"
                    size="default"
                    className="rounded-lg px-6 py-2"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-lg text-muted-foreground">
                  Join our curated community of home exchangers.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/auth/signin"
                    className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/apply"
                    className="rounded-lg border border-primary bg-transparent px-6 py-2 font-medium text-primary transition hover:bg-primary/10"
                  >
                    Apply for Membership
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground">
            $300/year membership · Trusted community · No booking fees
          </p>
        </div>
      </main>
    </HydrateClient>
  );
}
