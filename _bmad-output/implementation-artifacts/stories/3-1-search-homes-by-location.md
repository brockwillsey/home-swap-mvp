# Story 3.1: Search Homes by Location

Status: done

## Story

As a **member**,
I want **to search for homes by location**,
So that **I can find places to stay in my desired destination**.

## Acceptance Criteria

1. **Given** I am on the home page or search page
   **When** I view the search bar
   **Then** I see a location input field with autocomplete

2. **Given** I start typing a location
   **When** I enter text
   **Then** I see autocomplete suggestions from existing listings

3. **Given** I select a location from autocomplete
   **When** I submit the search
   **Then** I see results for homes in that location

4. **Given** I search for a location with no listings
   **When** results load
   **Then** I see an empty state with suggestions

## Tasks / Subtasks

- [x] Task 1: Create Search tRPC Router
  - [x] Create `src/server/api/routers/search.ts`
  - [x] Add `homes` query with location filter
  - [x] Add `locationSuggestions` query for autocomplete
  - [x] Register router in root

- [x] Task 2: Create SearchBar Component
  - [x] Create `src/components/search/SearchBar.tsx`
  - [x] Location input with debounced autocomplete
  - [x] Suggestions dropdown
  - [x] URL parameter handling

- [x] Task 3: Create Search Page
  - [x] Create `src/app/(member)/search/page.tsx`
  - [x] Integrate SearchBar component
  - [x] Parse URL search parameters

- [x] Task 4: Add Search to Navigation
  - [x] Add Search link to MemberHeader

- [x] Task 5: Verify Build
  - [x] Run `pnpm build` - passes
