"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

type ExchangeTypeFilter = "ALL" | "SWAP_ONLY" | "POINTS_ONLY" | "BOTH";
type BookingModeFilter = "ALL" | "INSTANT_BOOK" | "REQUIRES_APPROVAL";

interface SearchBarProps {
  initialLocation?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialExchangeType?: ExchangeTypeFilter;
  initialBookingMode?: BookingModeFilter;
}

/**
 * Search Bar Component
 *
 * Location search with autocomplete and date range selection.
 * Used on the search page for finding available homes.
 */
export function SearchBar({
  initialLocation = "",
  initialStartDate = "",
  initialEndDate = "",
  initialExchangeType = "ALL",
  initialBookingMode = "ALL",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(initialLocation);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [exchangeType, setExchangeType] = useState<ExchangeTypeFilter>(initialExchangeType);
  const [bookingMode, setBookingMode] = useState<BookingModeFilter>(initialBookingMode);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedLocation, setDebouncedLocation] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce location input for autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.length >= 2) {
        setDebouncedLocation(location);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [location]);

  // Get location suggestions
  const { data: suggestions = [] } = api.search.locationSuggestions.useQuery(
    { query: debouncedLocation },
    { enabled: debouncedLocation.length >= 2 }
  );

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();

    if (location.trim()) {
      params.set("location", location.trim());
    }
    if (startDate) {
      params.set("startDate", startDate);
    }
    if (endDate) {
      params.set("endDate", endDate);
    }
    if (exchangeType && exchangeType !== "ALL") {
      params.set("exchangeType", exchangeType);
    }
    if (bookingMode && bookingMode !== "ALL") {
      params.set("bookingMode", bookingMode);
    }

    router.push(`/search?${params.toString()}`);
  }

  function handleSelectSuggestion(suggestion: string) {
    setLocation(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      handleSearch();
    }
  }

  // Get min date (today) for date inputs
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* Location Input */}
        <div className="relative flex-1">
          <label
            htmlFor="location"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Where
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <input
              ref={inputRef}
              id="location"
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search destinations"
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-card shadow-lg"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div className="flex-1 md:max-w-[160px]">
          <label
            htmlFor="startDate"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Check in
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={today}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* End Date */}
        <div className="flex-1 md:max-w-[160px]">
          <label
            htmlFor="endDate"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Check out
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || today}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Exchange Type Filter */}
        <div className="flex-1 md:max-w-[140px]">
          <label
            htmlFor="exchangeType"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Type
          </label>
          <select
            id="exchangeType"
            value={exchangeType}
            onChange={(e) => setExchangeType(e.target.value as ExchangeTypeFilter)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Types</option>
            <option value="SWAP_ONLY">Swaps</option>
            <option value="POINTS_ONLY">Points</option>
            <option value="BOTH">Both</option>
          </select>
        </div>

        {/* Booking Mode Filter */}
        <div className="flex-1 md:max-w-[140px]">
          <label
            htmlFor="bookingMode"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Booking
          </label>
          <select
            id="bookingMode"
            value={bookingMode}
            onChange={(e) => setBookingMode(e.target.value as BookingModeFilter)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Any</option>
            <option value="INSTANT_BOOK">Instant Book</option>
            <option value="REQUIRES_APPROVAL">Request</option>
          </select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} className="h-[42px] px-6">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search
        </Button>
      </div>
    </div>
  );
}
