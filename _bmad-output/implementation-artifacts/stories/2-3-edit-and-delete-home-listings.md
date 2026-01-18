# Story 2.3: Edit and Delete Home Listings

Status: done

## Story

As a **member**,
I want **to edit or delete my home listings**,
So that **I can keep my listings accurate or remove them**.

## Acceptance Criteria

1. **Given** I am viewing my listing
   **When** I click "Edit"
   **Then** I can modify title, description, location, and photos

2. **Given** I have made edits to my listing
   **When** I save changes
   **Then** the listing is updated
   **And** I see a success confirmation

3. **Given** I want to delete a listing
   **When** I click "Delete" and confirm
   **Then** the listing is soft-deleted (not shown publicly)
   **And** any pending bookings show a warning

4. **Given** I have active confirmed bookings
   **When** I try to delete the listing
   **Then** I see a warning about existing bookings
   **And** I must cancel bookings first or wait until they complete

## Tasks / Subtasks

- [x] Task 1: Create Edit Listing Page
  - [x] Create `src/app/(member)/listings/[id]/edit/page.tsx`
  - [x] Load existing listing data
  - [x] Reuse ListingForm with edit mode

- [x] Task 2: Update ListingForm for Edit Mode
  - [x] Accept optional `listing` prop for edit mode
  - [x] Pre-fill form with existing data
  - [x] Use update mutation instead of create

- [x] Task 3: Add Delete Functionality
  - [x] Add `listing.delete` tRPC procedure (soft delete)
  - [x] Add delete confirmation dialog (DeleteListingButton)
  - [x] Booking check stubbed for Epic 4

- [x] Task 4: Add Edit/Delete Buttons to Listing Views
  - [x] Add buttons to photos page header

- [x] Task 5: Verify Build
  - [x] Run `pnpm build` - passes
