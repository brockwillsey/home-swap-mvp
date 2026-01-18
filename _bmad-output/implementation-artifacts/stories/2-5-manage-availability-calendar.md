# Story 2.5: Manage Availability Calendar

Status: done

## Story

As a **member**,
I want **to set and update availability dates for my home**,
So that **guests know when my home is available for booking**.

## Acceptance Criteria

1. **Given** I am editing my listing
   **When** I navigate to the availability section
   **Then** I see a calendar interface

2. **Given** I am on the availability calendar
   **When** I click and drag to select a date range
   **Then** those dates are marked as available (green)

3. **Given** I have set available dates
   **When** I click on an available range
   **Then** I can remove that availability

## Tasks / Subtasks

- [x] Task 1: Add Availability tRPC Procedures
  - [x] Add `listing.getAvailability` query
  - [x] Add `listing.addAvailability` mutation
  - [x] Add `listing.removeAvailability` mutation

- [x] Task 2: Create Availability Calendar Component
  - [x] Create `src/components/forms/AvailabilityCalendar.tsx`
  - [x] Render month grid with clickable dates
  - [x] Support date range selection
  - [x] Show existing availability in green

- [x] Task 3: Create Availability Page
  - [x] Create `src/app/(member)/listings/[id]/availability/page.tsx`
  - [x] Integrate calendar component
  - [x] Add navigation from photos page

- [x] Task 4: Verify Build
  - [x] Run `pnpm build` - passes
