# Story 2.1: Create Home Listing with Basic Info

Status: done

## Story

As a **member**,
I want **to create a listing for my home with title, description, and location**,
So that **other members can discover my property for exchanges**.

## Acceptance Criteria

1. **Given** I am a logged-in member
   **When** I click "Add Home" from my dashboard
   **Then** I see a listing creation form

2. **Given** I am on the listing form
   **When** I fill in title, description, and location (city/region)
   **Then** I can preview my listing before proceeding

3. **Given** I have entered valid listing details
   **When** I save the listing
   **Then** the home is created with status "draft"
   **And** I am directed to add photos

4. **Given** I enter a title longer than 100 characters
   **When** I try to proceed
   **Then** I see a validation error

## Tasks / Subtasks

- [x] Task 1: Create Listing Validation Schema (AC: #4)
  - [x] Create `src/lib/validations/listing.ts`
  - [x] Add title validation (required, max 100 chars)
  - [x] Add description validation (required, max 2000 chars)
  - [x] Add location validation (required, max 200 chars)

- [x] Task 2: Create Listing tRPC Router (AC: #3)
  - [x] Create `src/server/api/routers/listing.ts`
  - [x] Add `create` mutation (protectedProcedure, approved members only)
  - [x] Return created listing ID for redirect
  - [x] Register router in root

- [x] Task 3: Create Add Listing Page (AC: #1, #2)
  - [x] Create `src/app/(member)/listings/new/page.tsx`
  - [x] Build form with React Hook Form + Zod
  - [x] Add form fields: title, description, location
  - [x] Show preview card before submission

- [x] Task 4: Add Dashboard Link (AC: #1)
  - [x] Update dashboard to show "Add Home" button/card
  - [x] Link to /listings/new

- [x] Task 5: Verify Build and Types
  - [x] Run `pnpm build` to verify no TypeScript errors

## Technical Notes

### Database
- Uses existing `Home` model from Prisma schema
- Fields: title, description, location, ownerId
- Set `isActive: false` for draft status (no photos yet)

### Form Design
- Use shadcn/ui form components (Input, Textarea)
- Show character count for title (max 100)
- Preview shows Listing Card component style

### File List (Implemented)
- `src/lib/validations/listing.ts` (new)
- `src/server/api/routers/listing.ts` (new)
- `src/server/api/root.ts` (modified - register router)
- `src/components/forms/ListingForm.tsx` (new - form component)
- `src/app/(member)/listings/new/page.tsx` (new)
- `src/app/(member)/listings/[id]/photos/page.tsx` (new - placeholder for Story 2.2)
- `src/app/(member)/dashboard/page.tsx` (modified - add link)

## Review Follow-ups (AI)

- [ ] [AI-Review][MEDIUM] Add unit tests for listing validation schema [src/lib/validations/listing.ts]
- [ ] [AI-Review][MEDIUM] Add integration tests for listing tRPC router [src/server/api/routers/listing.ts]
- [ ] [AI-Review][MEDIUM] Add component tests for ListingForm [src/components/forms/ListingForm.tsx]

## Dev Notes

- Keep form simple for MVP - photos added in Story 2.2
- isActive=false until photos are added (draft state)
- Location is free-text for MVP (no geocoding)
