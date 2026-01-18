# Story 3.4: View Listing Detail Page

Status: done

## Story

As a **member**,
I want **to view a detailed listing page**,
So that **I can see full information before booking**.

## Acceptance Criteria

1. **Given** I click on a listing card from search results
   **When** the detail page loads
   **Then** I see: all photos in a gallery, full description, location

2. **Given** I am on the listing detail page
   **When** I view the photos section
   **Then** I can browse through all photos in a carousel/lightbox

3. **Given** I am on the listing detail page
   **When** I view the availability section
   **Then** I see the availability calendar showing available dates

## Tasks / Subtasks

- [x] Task 1: Create Listing Detail Page
  - [x] Create `src/app/(member)/search/[id]/page.tsx`
  - [x] Load listing with owner and availability data
  - [x] Show title, location, badges
  - [x] Show description card

- [x] Task 2: Create PhotoGallery Component
  - [x] Create `src/components/listing/PhotoGallery.tsx`
  - [x] Grid layout for multiple photos
  - [x] Lightbox with keyboard navigation
  - [x] Previous/next navigation

- [x] Task 3: Create AvailabilityDisplay Component
  - [x] Create `src/components/listing/AvailabilityDisplay.tsx`
  - [x] Read-only calendar view
  - [x] Show available periods highlighted
  - [x] List available periods

- [x] Task 4: Add Book/Request Button
  - [x] Show placeholder button for Epic 4
  - [x] Different text for Instant Book vs Requires Approval

- [x] Task 5: Verify Build
  - [x] Run `pnpm build` - passes
