# Story 2.2: Upload Multiple Photos for Listing

Status: done

## Story

As a **member**,
I want **to upload multiple photos for my home listing**,
So that **guests can see what my home looks like**.

## Acceptance Criteria

1. **Given** I am creating or editing a listing
   **When** I reach the photos step
   **Then** I see an upload area supporting multiple images

2. **Given** I select photos to upload
   **When** the upload completes
   **Then** photos are stored in Cloudinary with optimization
   **And** I see previews with drag-to-reorder capability
   **And** I can set one photo as the primary/cover image

3. **Given** I have uploaded photos
   **When** I want to remove one
   **Then** I can click delete on any photo
   **And** the photo is removed from the listing

4. **Given** I try to publish with fewer than 3 photos
   **When** I click publish
   **Then** I see a validation requiring at least 3 photos

## Tasks / Subtasks

- [x] Task 1: Set up Cloudinary Integration (AC: #2)
  - [x] Cloudinary already configured from Story 1.4
  - [x] Upload preset `art_res_homes` exists
  - [x] Environment variables documented

- [x] Task 2: Create ListingPhotosUpload Component (AC: #1, #2)
  - [x] Create `src/components/forms/ListingPhotosUpload.tsx`
  - [x] Use CldUploadWidget for uploads
  - [x] Show upload progress indicator
  - [x] Display photo previews in grid

- [x] Task 3: Add Drag-to-Reorder Functionality (AC: #2)
  - [x] Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
  - [x] Implement SortablePhoto component with useSortable
  - [x] Update photo order in state on drag end

- [x] Task 4: Implement Primary Photo Selection (AC: #2)
  - [x] Add "Set Cover" button on each non-primary photo
  - [x] Visual "Cover" badge on primary photo (index 0)
  - [x] First photo is default primary

- [x] Task 5: Add Photo Delete Functionality (AC: #3)
  - [x] Add delete button on each photo preview
  - [x] Remove photo from state immediately
  - [x] Photos removed from listing on save

- [x] Task 6: Create Photos tRPC Procedures (AC: #2, #3, #4)
  - [x] Add `listing.updatePhotos` mutation (replaces array)
  - [x] Add `listing.publish` mutation (validates min 3 photos)

- [x] Task 7: Update Photos Page (AC: #1, #4)
  - [x] Create `ListingPhotosForm` client component
  - [x] Auto-save photos on change (debounced)
  - [x] Add "Publish Listing" button with validation

- [x] Task 8: Verify Build and Types
  - [x] Run `pnpm build` - passes

## Technical Notes

### Cloudinary Setup
- Uses existing `art_res_homes` upload preset
- Auto-optimize images (quality, format)
- Store photo URLs in Home.photos array (String[])

### Photo Data Structure
```typescript
interface ListingPhoto {
  id: string;       // Unique ID for drag-and-drop
  url: string;      // Cloudinary URL
  publicId: string; // For potential deletion
}
```

### Drag-and-Drop
- Uses @dnd-kit for accessible drag-and-drop
- Keyboard support via KeyboardSensor
- Photo order stored in array index (first = primary)

### File List (Implemented)
- `src/lib/services/cloudinary.ts` (existing - has homes preset)
- `src/components/forms/ListingPhotosUpload.tsx` (new)
- `src/components/forms/ListingPhotosForm.tsx` (new)
- `src/server/api/routers/listing.ts` (modified - added updatePhotos, publish)
- `src/app/(member)/listings/[id]/photos/page.tsx` (modified)

## Review Follow-ups (AI)

- [ ] [AI-Review][LOW] Refactor useEffect to avoid mutation object in dependencies [src/components/forms/ListingPhotosForm.tsx:78]
- [ ] [AI-Review][MEDIUM] Add integration tests for photo upload flow

## Dev Notes

- Cloudinary free tier: 25GB storage, 25GB bandwidth
- Max file size: 10MB per image
- Supported formats: jpg, png, webp, gif
- Auto-save debounced to 1 second to avoid excessive API calls
- Photos auto-save on change, manual save also available
