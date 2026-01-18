# Story 2.6: Configure Booking Mode

Status: done

## Story

As a **member**,
I want **to choose between instant book and requires approval for my listing**,
So that **I can control how guests book my home**.

## Acceptance Criteria

1. **Given** I am editing my listing settings
   **When** I view the booking mode section
   **Then** I see two options: "Instant Book" and "Requires Approval"

2. **Given** I select "Instant Book"
   **When** I save the setting
   **Then** guests can book without my confirmation
   **And** my listing shows an "Instant Book" badge

3. **Given** I select "Requires Approval"
   **When** I save the setting
   **Then** booking requests require my approval

## Tasks / Subtasks

- [x] Task 1: Add Booking Mode tRPC Procedure
  - [x] Add `listing.updateBookingMode` mutation
  - [x] Validate ownership before update
  - [x] Support INSTANT_BOOK and REQUIRES_APPROVAL enum values

- [x] Task 2: Create Settings Page
  - [x] Create `src/app/(member)/listings/[id]/settings/page.tsx`
  - [x] Add ownership verification
  - [x] Integrate ListingSettingsForm

- [x] Task 3: Create Settings Form Component
  - [x] Create `src/components/forms/ListingSettingsForm.tsx`
  - [x] Show Instant Book and Requires Approval options as cards
  - [x] Optimistic UI updates with toast notifications

- [x] Task 4: Add Settings Navigation
  - [x] Add Settings button to photos page header

- [x] Task 5: Display Booking Mode Badge
  - [x] Show "Instant Book" badge on listings page when enabled

- [x] Task 6: Verify Build
  - [x] Run `pnpm build` - passes
