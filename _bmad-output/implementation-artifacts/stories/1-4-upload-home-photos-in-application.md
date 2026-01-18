# Story 1.4: Upload Home Photos in Application

Status: in-progress

## Story

As a **visitor applying for membership**,
I want **to upload photos of my home as part of my application**,
so that **admins can assess my property for community fit**.

## Acceptance Criteria

1. **Given** I am on the application form
   **When** I reach the home photos section
   **Then** I see an upload area for multiple photos (minimum 3 required)

2. **Given** I am uploading home photos
   **When** I select images from my device
   **Then** photos are uploaded to Cloudinary with optimization
   **And** I see previews of each uploaded photo
   **And** I can remove photos before submission

3. **Given** I have uploaded fewer than 3 photos
   **When** I try to proceed
   **Then** I see a validation message requiring at least 3 photos

## Tasks / Subtasks

- [x] Task 1: Create Home Photos Upload Component (AC: #1, #2)
  - [x] Create `src/components/forms/HomePhotosUpload.tsx`
  - [x] Use next-cloudinary CldUploadWidget (reuse pattern from ProfilePhotoUpload)
  - [x] Support multiple file upload (up to 10 photos)
  - [x] Display grid of photo previews with CldImage
  - [x] Add remove button on each photo preview
  - [x] Use CLOUDINARY_UPLOAD_PRESET_HOMES preset (already defined)
  - [x] Return array of Cloudinary URLs to parent form

- [x] Task 2: Update Application Validation Schema (AC: #3)
  - [x] Update `src/lib/validations/application.ts`
  - [x] Add homePhotos field as array of Cloudinary URLs
  - [x] Add minimum 3 photos validation with custom error message
  - [x] Add maximum 10 photos validation
  - [x] Validate each URL is from Cloudinary domain

- [x] Task 3: Update Application tRPC Router (AC: #1, #2, #3)
  - [x] Update `src/server/api/routers/application.ts`
  - [x] Add homePhotos to create mutation input
  - [x] Save homePhotos array to Application model

- [x] Task 4: Update Application Form Component (AC: #1, #2, #3)
  - [x] Update `src/components/forms/ApplicationForm.tsx`
  - [x] Add "Your Home" section with HomePhotosUpload
  - [x] Integrate with React Hook Form for homePhotos field
  - [x] Show validation error when fewer than 3 photos

- [x] Task 5: Verify Build and Test (AC: #1, #2, #3)
  - [x] Run `npm run typecheck` - no TypeScript errors
  - [x] Run `npm run build` - production build succeeds
  - [ ] Manual test: Upload 3+ photos, verify previews, remove, submit

### Review Follow-ups (AI)

- [x] [AI-Review][HIGH] Set up test framework (vitest/jest) - DONE: vitest configured with React Testing Library
- [x] [AI-Review][HIGH] Write unit tests for homePhotosSchema validation (min 3, max 10, Cloudinary domain) - DONE: 13 tests passing
- [ ] [AI-Review][HIGH] Add upload progress indicator (Dev Notes line 190 specifies this but not implemented)
- [ ] [AI-Review][LOW] Improve array validation error messages to indicate which photo URL failed

## Dev Notes

### Technology Stack (From Architecture)

| Component | Choice | Version/Details |
|-----------|--------|-----------------|
| Image Upload | Cloudinary | next-cloudinary (already installed) |
| Forms | React Hook Form | With Zod resolver |
| Validation | Zod | Shared client/server schemas |
| API | tRPC | Type-safe mutations |
| UI Components | shadcn/ui | Already set up |

### Previous Story Intelligence (1.3)

**Critical Learnings from Code Review:**
1. **P1 Security**: URLs must be validated as Cloudinary domain using `.refine()`
2. **P2 Security**: Rate limiting is already in place via `rateLimitedProcedure`
3. **P3 Code Quality**: All text inputs should be trimmed with `.trim().pipe()`
4. **P3 Code Quality**: Log actual upload errors with `console.error()`

**Files Created That Are Directly Relevant:**
- `src/lib/services/cloudinary.ts` - Already has `CLOUDINARY_UPLOAD_PRESET_HOMES` constant
- `src/lib/validations/application.ts` - Has `cloudinaryUrlSchema` pattern to reuse
- `src/components/forms/ProfilePhotoUpload.tsx` - Pattern for single photo upload
- `src/components/forms/ApplicationForm.tsx` - Form to extend

**Cloudinary Configuration Already Set Up:**
```typescript
// From src/lib/services/cloudinary.ts
export const CLOUDINARY_UPLOAD_PRESET_HOMES = "art_res_homes";
export const CLOUDINARY_FOLDERS = {
  profiles: "art-res/profiles",
  homes: "art-res/homes",  // Use this folder for home photos
} as const;
```

### Prisma Schema (Already Exists)

The Application model already has the `homePhotos` field:

```prisma
model Application {
  id            String            @id @default(cuid())
  userId        String            @unique
  status        ApplicationStatus @default(PENDING)
  bio           String
  location      String
  creativeInterests String
  reasonForJoining String
  profilePhotoUrl String?
  homePhotos    String[]          // <-- Already exists for this story
  // ... other fields
}
```

### Implementation Patterns

**1. HomePhotosUpload Component Pattern:**
```typescript
// Similar to ProfilePhotoUpload but for multiple images
// Key differences:
// - value: string[] instead of string
// - maxFiles: 10 in CldUploadWidget options
// - Grid layout for previews instead of single circle
// - Individual remove buttons per photo
```

**2. Validation Schema Update:**
```typescript
// Add to applicationFormSchema in src/lib/validations/application.ts
homePhotos: z
  .array(
    z.string().url().refine(
      (url) => url.startsWith("https://res.cloudinary.com/"),
      "Invalid photo URL"
    )
  )
  .min(3, "Please upload at least 3 photos of your home")
  .max(10, "Maximum 10 photos allowed"),
```

**3. tRPC Router Update:**
The `create` mutation already handles all fields from the schema automatically.
Just need to ensure homePhotos is included in the Prisma create data.

### File Structure

**Files to Create:**
```
src/components/forms/HomePhotosUpload.tsx  # Multi-photo upload component
```

**Files to Modify:**
```
src/lib/validations/application.ts         # Add homePhotos field
src/server/api/routers/application.ts      # Include homePhotos in create
src/components/forms/ApplicationForm.tsx   # Add home photos section
```

### Naming Conventions (MUST Follow)

| Element | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase.tsx | `HomePhotosUpload.tsx` |
| Validation schemas | camelCase | `applicationFormSchema` |
| Props interfaces | PascalCase | `HomePhotosUploadProps` |

### Critical Architecture Rules

1. **ALWAYS use shadcn/ui components** - Button, Card for photo grid
2. **ALWAYS use Zod schemas** from `lib/validations/` - no inline validation
3. **ALWAYS use next-cloudinary** CldUploadWidget and CldImage
4. **Validate Cloudinary URLs** - use the cloudinaryUrlSchema pattern from 1.3
5. **Log upload errors** - use console.error for debugging

### Cloudinary Dashboard Setup

**Upload Preset for Home Photos:**
- Preset name: `art_res_homes` (may need to create if not exists)
- Mode: Unsigned (for direct browser uploads)
- Folder: `art-res/homes`
- Transformations: auto quality, auto format, max 1200x800

### UX Design Notes

**Photo Grid Layout:**
- 3-column grid on desktop (min-width: 768px)
- 2-column grid on mobile
- Aspect ratio: 4:3 for home photos (landscape)
- Show upload progress indicator
- Clear "Add photos" button with plus icon
- Minimum 3 photos indicator (e.g., "3 of 3 required")

**Photo Preview:**
- Rounded corners (rounded-lg)
- Hover state shows remove button
- Remove button: red X in top-right corner
- Show count: "3/10 photos"

### Testing Approach

**Manual Testing:**
1. Navigate to `/apply`
2. Fill profile info and upload profile photo
3. Scroll to home photos section
4. Try to submit with 0 photos → validation error
5. Upload 2 photos → try submit → validation error
6. Upload 3rd photo → submit should work
7. Upload 10 photos → try to add 11th → should be prevented
8. Remove a photo → verify it disappears from preview
9. Submit → verify homePhotos array saved to database

**Edge Cases:**
- Upload fails midway → show error, allow retry
- Remove all photos → validation error on submit
- Upload non-image file → Cloudinary widget should reject

### References

- [Source: architecture.md#Infrastructure & Deployment] - Cloudinary choice
- [Source: architecture.md#Implementation Patterns] - Naming conventions
- [Source: epics.md#Story 1.4: Upload Home Photos in Application]
- [Source: prisma/schema.prisma#Application model] - homePhotos field
- [Source: 1-3-build-member-application-form.md] - Previous story patterns
- [next-cloudinary CldUploadWidget](https://next.cloudinary.dev/clduploadwidget/basic-usage)

### Dependencies on Other Stories

**Depends On:**
- Story 1.1 (done) - Project foundation, Prisma schema
- Story 1.2 (done) - Auth patterns, validation patterns
- Story 1.3 (done) - Cloudinary integration, ApplicationForm

**Depended On By:**
- Story 1.5 - Payment processing (uses complete application)
- Story 7.x - Admin reviews applications (views home photos)

## Senior Developer Review (AI)

**Review Date:** 2026-01-17
**Reviewer:** Claude Opus 4.5 (Code Review Agent)
**Outcome:** Changes Requested

### Action Items

- [x] [CRITICAL] Task 5 marked complete but manual test subtask incomplete - Added Review Follow-ups section
- [x] [MEDIUM] Accessibility: Remove button only visible on hover - Fixed: Always visible on mobile, keyboard focusable
- [x] [MEDIUM] Touch device accessibility - Fixed: Button visible (opacity-70) on mobile devices
- [x] [MEDIUM] React key anti-pattern using index - Fixed: Using only URL as key
- [x] [LOW] No aria-live for count updates - Fixed: Added aria-live="polite" and aria-atomic="true"
- [x] [HIGH] No unit/integration tests - FIXED: vitest set up, 13 validation tests written and passing
- [ ] [HIGH] Missing upload progress indicator - Deferred to Review Follow-ups
- [ ] [LOW] Generic error messages in array validation - Deferred to Review Follow-ups

**Issues Fixed:** 6
**Issues Deferred:** 2 (added to Review Follow-ups)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **HomePhotosUpload Component Created**: Multi-photo upload component supporting 3-10 photos with:
   - Grid layout (3 columns desktop, 2 columns mobile)
   - Photo previews with CldImage using fill and object-cover
   - Remove buttons that appear on hover
   - Photo count indicator showing "X of 3 required"
   - Cloudinary domain validation for security
   - Error logging with console.error for debugging

2. **Validation Schema Updated**: Added `homePhotosSchema` with:
   - Array of Cloudinary URL strings with domain validation via `.refine()`
   - Minimum 3 photos with user-friendly error message
   - Maximum 10 photos limit

3. **tRPC Router Updated**: Added `homePhotos` field to:
   - Input destructuring
   - Reapplication update (for REJECTED/NEEDS_INFO status)
   - New application create in transaction

4. **ApplicationForm Updated**: Added "Your Home" section with:
   - HomePhotosUpload component integrated with React Hook Form
   - Validation errors displayed via FormMessage
   - Disabled state during submission

5. **Build Verification**:
   - TypeScript typecheck: PASSED
   - Production build: PASSED (10/10 pages generated)

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-17 | Story created with comprehensive context from Story 1.3 | SM Agent (Claude Opus 4.5) |
| 2026-01-17 | Implemented all tasks: HomePhotosUpload component, validation schema, tRPC router, and form integration | Dev Agent (Claude Opus 4.5) |
| 2026-01-17 | Code review: Fixed 5 issues (accessibility, key prop, aria-live). Deferred 3 to Review Follow-ups | Code Review Agent (Claude Opus 4.5) |
| 2026-01-17 | Set up vitest testing framework, wrote 13 validation schema tests (all passing) | Dev Agent (Claude Opus 4.5) |

### File List

**Created:**
- src/components/forms/HomePhotosUpload.tsx
- vitest.config.ts (test framework configuration)
- src/test/setup.ts (test setup file)
- src/lib/validations/__tests__/application.test.ts (13 validation tests)

**Modified:**
- src/lib/validations/application.ts (added homePhotosSchema and homePhotos field)
- src/server/api/routers/application.ts (added homePhotos to create mutation)
- src/components/forms/ApplicationForm.tsx (added HomePhotosUpload import and form section)
- package.json (added test scripts and testing dependencies)
