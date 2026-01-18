"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

/**
 * Client component for refresh button
 * Used on success page when payment is still processing
 */
export function RefreshButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.refresh()}>
      Refresh Page
    </Button>
  );
}
