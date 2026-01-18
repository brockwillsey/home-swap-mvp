import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { MemberHeader } from "~/components/layout/MemberHeader";
import { MessagesContent } from "~/components/messages/MessagesContent";
import { Card, CardContent } from "~/components/ui/card";

/**
 * Messages Page
 *
 * Shows all conversations and allows messaging.
 * Stories 6-1 through 6-6.
 */
export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/messages");
  }

  // Get user for header
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, points: true },
  });

  return (
    <main className="min-h-screen bg-background">
      <MemberHeader userName={user?.name} userPoints={user?.points} activePage="messages" />

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Messages</h1>

        <Suspense fallback={<MessagesSkeleton />}>
          <MessagesContent />
        </Suspense>
      </div>
    </main>
  );
}

function MessagesSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Conversations list skeleton */}
      <Card className="lg:col-span-1">
        <CardContent className="py-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thread skeleton */}
      <Card className="lg:col-span-2">
        <CardContent className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">Select a conversation</p>
        </CardContent>
      </Card>
    </div>
  );
}
