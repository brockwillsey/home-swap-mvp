import Link from "next/link";
import Image from "next/image";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { SignOutButton } from "~/components/auth/SignOutButton";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="relative min-h-screen">
        {/* Full-screen Hero Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero.jpg"
            alt="Japanese pottery studio with traditional shoji screens"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
          <div className="container flex flex-col items-center justify-center gap-12">
            {/* Musa Residency Logo/Title */}
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
                Musa Residency
              </h1>
              <p className="mt-4 text-xl text-white/90 sm:text-2xl">
                Creative Home Exchange Community
              </p>
            </div>

            {/* Value Proposition */}
            <div className="grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white">
                  Curated Community
                </h3>
                <p className="mt-2 text-sm text-white/80">
                  Join a trusted network of creative professionals and
                  experience-seekers.
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white">
                  Easy Exchange
                </h3>
                <p className="mt-2 text-sm text-white/80">
                  Book directly without endless messaging. Swap homes or use
                  points.
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white">
                  Beautiful Homes
                </h3>
                <p className="mt-2 text-sm text-white/80">
                  Stay in thoughtfully designed spaces in creative cities
                  worldwide.
                </p>
              </div>
            </div>

            {/* Auth Section */}
            <div className="flex flex-col items-center gap-4">
              {session ? (
                <>
                  <p className="text-lg text-white">
                    Welcome back, {session.user?.name ?? session.user?.email}!
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href="/dashboard"
                      className="rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition hover:bg-white/90"
                    >
                      Go to Dashboard
                    </Link>
                    <SignOutButton
                      variant="secondary"
                      size="default"
                      className="rounded-lg border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur-sm hover:bg-white/20"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg text-white/90">
                    Join our curated community of home exchangers.
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href="/auth/signin"
                      className="rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition hover:bg-white/90"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/apply"
                      className="rounded-lg border border-white/50 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                    >
                      Apply for Membership
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <p className="text-sm text-white/70">
              $300/year membership · Trusted community · No booking fees
            </p>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
