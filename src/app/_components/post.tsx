"use client";

import { api } from "~/trpc/react";

export function WelcomeMessage() {
  const hello = api.post.hello.useQuery({ text: "Art Res Member" });

  return (
    <div className="w-full max-w-xs text-center">
      <p className="text-lg">
        {hello.data ? hello.data.greeting : "Loading..."}
      </p>
    </div>
  );
}
