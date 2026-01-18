# Story 2.8: View All My Listings Dashboard

Status: done

## Story

As a **member**,
I want **to see all my home listings in one place**,
So that **I can manage my properties efficiently**.

## Acceptance Criteria

1. **Given** I am logged in
   **When** I navigate to "My Listings"
   **Then** I see a grid/list of all my home listings

2. **Given** I view my listings dashboard
   **When** I see each listing card
   **Then** it shows: cover photo, title, location, booking mode badge, availability status

3. **Given** I have no listings
   **When** I view My Listings
   **Then** I see an empty state with "Add Your First Home" button

4. **Given** I click on a listing card
   **When** the detail opens
   **Then** I can quickly edit or view full details

## Tasks / Subtasks

- [x] Task 1: Create My Listings Page (completed in Story 2-4)
  - [x] Create `src/app/(member)/listings/page.tsx`
  - [x] Grid layout for listing cards
  - [x] Empty state with CTA

- [x] Task 2: Enhance Listing Cards with Status Information
  - [x] Show cover photo with status badges
  - [x] Show "Instant Book" badge when booking mode is INSTANT_BOOK
  - [x] Show exchange type (Swaps & Points, Swaps Only, Points Only)
  - [x] Show availability status with next available date

- [x] Task 3: Include Availability Data in Query
  - [x] Join availability table to show next available date
  - [x] Filter to future availability only
  - [x] Show "No availability set" if none exists

- [x] Task 4: Verify Build
  - [x] Run `pnpm build` - passes
