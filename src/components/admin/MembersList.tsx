"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

/**
 * Members List Component
 *
 * Shows all approved members with search.
 * Story 7-7.
 */
export function MembersList() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = api.admin.getMembers.useQuery({
    search: search || undefined,
    limit: 50,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button type="submit">Search</Button>
        {search && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch("");
              setSearchInput("");
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : data?.members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <div className="mb-4 rounded-full bg-muted p-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold">No members found</h3>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try a different search term"
                : "No approved members yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {data?.members.length} member{data?.members.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </p>

          <div className="space-y-2">
            {data?.members.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  {/* Profile Photo */}
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name ?? "Member"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                        {member.name?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold">{member.name ?? "No name"}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.location ?? "No location"} • Member since{" "}
                      {new Date(member.memberSince).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                      {member.listingCount > 0 && (
                        <> • {member.listingCount} listing{member.listingCount !== 1 ? "s" : ""}</>
                      )}
                    </p>
                  </div>

                  {/* View Button */}
                  <Button variant="outline" asChild>
                    <Link href={`/members/${member.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
