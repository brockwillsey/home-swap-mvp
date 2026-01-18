# Story 3.3: View Search Results Grid

Status: done

## Story

As a **member**,
I want **to view search results showing available homes**,
So that **I can browse and compare options**.

## Acceptance Criteria

1. **Given** I have submitted a search
   **When** results load
   **Then** I see a grid of Listing Card components

2. **Given** I view the results grid
   **When** I look at each listing card
   **Then** I see: cover photo, title, location, host name, booking mode badge

3. **Given** there are many results
   **When** I scroll down
   **Then** additional results load (infinite scroll)

4. **Given** I am on mobile
   **When** I view results
   **Then** I see a responsive layout

## Tasks / Subtasks

- [x] Task 1: Create ListingCard Component
  - [x] Create `src/components/cards/ListingCard.tsx`
  - [x] Show cover photo, title, location
  - [x] Show host name and avatar
  - [x] Show Instant Book badge when applicable
  - [x] Show availability info

- [x] Task 2: Create SearchResults Component
  - [x] Create `src/components/search/SearchResults.tsx`
  - [x] Grid layout with responsive columns
  - [x] Results count display
  - [x] Empty state handling

- [x] Task 3: Implement Infinite Scroll
  - [x] Install react-intersection-observer
  - [x] Use cursor-based pagination from tRPC
  - [x] Auto-load more on scroll

- [x] Task 4: Verify Build
  - [x] Run `pnpm build` - passes
