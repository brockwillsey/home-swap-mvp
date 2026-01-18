# Story 1.8: Display Membership Status

Status: done

## Story

As a **member**,
I want **to see my membership status and renewal date**,
So that **I know when my membership expires**.

## Acceptance Criteria

1. **Given** I am on my profile or dashboard
   **When** I view my membership section
   **Then** I see my membership status (active/expired)
   **And** I see my membership start date
   **And** I see my renewal date (1 year from start)

2. **Given** my membership expires in 30 days
   **When** I view my dashboard
   **Then** I see a renewal reminder

## Tasks / Subtasks

- [x] Task 1: Create Membership Status Component (AC: #1)
  - [x] Create `src/components/membership/MembershipStatus.tsx`
  - [x] Display membership status (active/expired)
  - [x] Display membership start date (Application.reviewedAt)
  - [x] Calculate and display renewal date (start + 1 year)
  - [x] Style with appropriate colors (green=active, yellow=expiring, red=expired)

- [x] Task 2: Add Membership Status to Profile Page (AC: #1)
  - [x] Import MembershipStatus component
  - [x] Display in profile sidebar or dedicated section
  - [x] Pass membership data from Application

- [x] Task 3: Add Membership Status to Dashboard (AC: #1, #2)
  - [x] Add membership section to dashboard
  - [x] Show renewal reminder if expiring within 30 days
  - [x] Show expired warning if membership has lapsed

- [x] Task 4: Create Renewal Reminder Component (AC: #2)
  - [x] Create alert/banner for expiring memberships
  - [x] Show days remaining until expiry
  - [x] Include link to renewal flow (placeholder for now)

- [x] Task 5: Verify Build and Types
  - [x] Run `pnpm build` to verify no TypeScript errors
  - [x] Run `pnpm test` to verify existing tests pass

## Technical Notes

### Data Source
- Membership start date: `Application.reviewedAt` (when approved)
- Membership expiry: `reviewedAt + 1 year`
- Status calculation:
  - Active: current date < expiry date
  - Expiring Soon: expiry date within 30 days
  - Expired: current date >= expiry date

### UI Design
- Use Card component for membership section
- Color coding:
  - Green badge for "Active"
  - Yellow/amber badge for "Expiring Soon"
  - Red badge for "Expired"
- Show clear dates in user-friendly format

### File List (Expected)
- `src/components/membership/MembershipStatus.tsx` (new)
- `src/app/(member)/profile/page.tsx` (modified)
- `src/app/(member)/dashboard/page.tsx` (modified)

## Dev Notes

- Application.reviewedAt may be null if not yet approved - handle gracefully
- For MVP, renewal is display-only (no actual renewal flow yet)
- Stripe subscription renewal will be added in future iteration
