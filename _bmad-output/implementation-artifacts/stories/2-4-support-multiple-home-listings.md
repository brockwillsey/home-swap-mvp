# Story 2.4: Support Multiple Home Listings

Status: done

## Story

As a **member with multiple properties**,
I want **to create listings for each of my homes**,
So that **I can offer multiple locations for exchange**.

## Acceptance Criteria

1. **Given** I am a member with one listing
   **When** I click "Add Another Home"
   **Then** I can create a new listing independent of my first

2. **Given** I have multiple listings
   **When** I view my listings dashboard
   **Then** I see all my homes listed with their status
   **And** each listing has its own availability calendar

## Tasks / Subtasks

- [x] Task 1: Create My Listings Page
  - [x] Create `src/app/(member)/listings/page.tsx`
  - [x] Display grid of user's listings with photos
  - [x] Show listing status (Draft/Published badges)
  - [x] Add "Add Home" button

- [x] Task 2: Update Dashboard Link
  - [x] Change card to link to /listings
  - [x] Show listing count on dashboard card

- [x] Task 3: Verify Build
  - [x] Run `pnpm build` - passes
