# Story 1.6: Create Member Profile Management

Status: done

## Story

As a **member**,
I want **to view and edit my profile information**,
So that **I can keep my community presence up to date**.

## Acceptance Criteria

1. **Given** I am a logged-in approved member
   **When** I navigate to my profile page
   **Then** I see my current profile information: name, bio, photo, location, creative interests

2. **Given** I am viewing my profile
   **When** I click "Edit Profile"
   **Then** I can modify all profile fields
   **And** I can upload a new profile photo

3. **Given** I have made changes to my profile
   **When** I save the changes
   **Then** my profile is updated
   **And** I see a success confirmation toast

4. **Given** I am not an approved member
   **When** I try to access the profile page
   **Then** I am redirected appropriately (to dashboard or application status)

## Tasks / Subtasks

- [x] Task 1: Create Profile tRPC Router (AC: #1, #3)
  - [x] Create `src/server/api/routers/profile.ts`
  - [x] Add `getProfile` query to fetch current user's profile data
  - [x] Add `updateProfile` mutation with Zod validation
  - [x] Register router in `src/server/api/root.ts`
  - [x] Use `protectedProcedure` for authentication
  - [x] Copy data from Application to User on first profile load if not set

- [x] Task 2: Create Profile Validation Schema (AC: #2, #3)
  - [x] Create `src/lib/validations/profile.ts`
  - [x] Define schema for profile fields: name, bio, location, creativeInterests, image
  - [x] Reuse constraints from application validation where appropriate
  - [x] Export types for TypeScript

- [x] Task 3: Create Profile View Page (AC: #1, #4)
  - [x] Create `src/app/(member)/profile/page.tsx` as server component
  - [x] Verify user is authenticated and has APPROVED application
  - [x] Redirect non-approved users to `/dashboard` or `/apply`
  - [x] Display profile data: photo, name, bio, location, creative interests
  - [x] Add "Edit Profile" button linking to edit page
  - [x] Show member since date (createdAt)

- [x] Task 4: Create Profile Edit Page (AC: #2, #3)
  - [x] Create `src/app/(member)/profile/edit/page.tsx`
  - [x] Create `src/components/forms/ProfileEditForm.tsx` client component
  - [x] Use React Hook Form + Zod resolver
  - [x] Pre-populate form with current profile data
  - [x] Include ProfilePhotoUpload component for photo changes
  - [x] Add Cancel button that returns to profile view
  - [x] Show loading state during save
  - [x] Display validation errors inline

- [x] Task 5: Implement Profile Photo Update (AC: #2)
  - [x] Reuse existing Cloudinary upload infrastructure
  - [x] Allow replacing existing profile photo
  - [x] Store new photo URL in User.image field
  - [x] Show current photo preview in edit form

- [x] Task 6: Add Success Toast Notification (AC: #3)
  - [x] Use Sonner toast (already configured in project)
  - [x] Show "Profile updated successfully" on save
  - [x] Redirect to profile view page after save

- [x] Task 7: Update Dashboard with Profile Link (AC: #1)
  - [x] Add "View Profile" or user avatar link in dashboard/navigation
  - [x] Show user's profile photo in navigation if available

- [x] Task 8: Verify Build and Types
  - [x] Run `pnpm build` to verify no TypeScript errors
  - [x] Run `pnpm test` to verify existing tests pass

## Technical Notes

### Existing Infrastructure to Reuse
- `ProfilePhotoUpload` component from Story 1-4 (Cloudinary integration)
- `protectedProcedure` from tRPC for authentication
- Sonner toast for notifications
- shadcn/ui Card, Button, Form components
- User model already has profile fields: name, image, bio, location, creativeInterests

### Data Flow
- Profile data initially comes from Application during approval
- After approval, user can edit User model fields directly
- First profile load should sync Application data to User if User fields are empty

### Security Considerations
- Only authenticated users can view/edit profiles
- Users can only edit their own profile
- Profile photo upload uses same secure Cloudinary flow as application

### File List (Expected)
- `src/server/api/routers/profile.ts` (new)
- `src/lib/validations/profile.ts` (new)
- `src/app/(member)/profile/page.tsx` (new)
- `src/app/(member)/profile/edit/page.tsx` (new)
- `src/components/forms/ProfileEditForm.tsx` (new)
- `src/server/api/root.ts` (modified - register router)
- `src/app/(member)/dashboard/page.tsx` (modified - add profile link)

## Dev Notes

- The User model already has all required fields from the schema
- Application bio/location/creativeInterests should sync to User on approval
- For MVP, we'll sync on profile load if User fields are empty
