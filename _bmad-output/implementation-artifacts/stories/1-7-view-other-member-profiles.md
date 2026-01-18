# Story 1.7: View Other Member Profiles

Status: done

## Story

As a **member**,
I want **to view other members' profiles**,
So that **I can learn about potential exchange partners and build trust**.

## Acceptance Criteria

1. **Given** I am a logged-in member
   **When** I view another member's profile page
   **Then** I see their: name, bio, photo, location, creative interests, member since date
   **And** I see their listed homes (if any)

2. **Given** I am not logged in
   **When** I try to access a member profile
   **Then** I am redirected to the sign-in page

## Tasks / Subtasks

- [x] Task 1: Create Member Profile tRPC Procedure (AC: #1)
  - [x] Add `getMemberById` query to profile router
  - [x] Only return approved member profiles
  - [x] Include member since date and public profile fields
  - [x] Exclude private data (email, etc.)

- [x] Task 2: Create Public Member Profile Page (AC: #1, #2)
  - [x] Create `src/app/(member)/members/[id]/page.tsx`
  - [x] Verify user is authenticated (redirect if not)
  - [x] Display member photo, name, bio, location, creative interests
  - [x] Show "Member since" date
  - [x] Handle member not found (404)

- [x] Task 3: Display Member's Listed Homes (AC: #1)
  - [x] Query for member's active home listings (placeholder for Epic 2)
  - [x] Display homes section (empty state for now)
  - [x] Show "No homes listed yet" if member has no listings

- [x] Task 4: Add Members Directory Page (Optional Enhancement)
  - [x] Create `src/app/(member)/members/page.tsx`
  - [x] List all approved members with basic info
  - [x] Link each member to their profile page

- [x] Task 5: Add Navigation Links
  - [x] Add link to member profile from dashboard (if viewing other members)
  - [x] Ensure profile links work from anywhere members are displayed

- [x] Task 6: Verify Build and Types
  - [x] Run `pnpm build` to verify no TypeScript errors
  - [x] Run `pnpm test` to verify existing tests pass

## Technical Notes

### Existing Infrastructure to Reuse
- Profile router from Story 1-6
- `protectedProcedure` from tRPC for authentication
- shadcn/ui Card, Button components
- User model with profile fields

### Security Considerations
- Only authenticated members can view other profiles
- Only show approved members' profiles
- Don't expose email or other private data
- Member ID in URL should be the user's ID (not email)

### Data to Display
- name
- image (profile photo)
- bio
- location
- creativeInterests
- createdAt (member since)
- Listed homes (future - from Home model)

### File List (Expected)
- `src/server/api/routers/profile.ts` (modified - add getMemberById)
- `src/app/(member)/members/[id]/page.tsx` (new)
- `src/app/(member)/members/page.tsx` (new - optional directory)

## Dev Notes

- Home listings will be added in Epic 2, for now show empty state
- The member profile URL pattern is `/members/[id]` where id is the user ID
- Re-use similar layout to own profile page for consistency
