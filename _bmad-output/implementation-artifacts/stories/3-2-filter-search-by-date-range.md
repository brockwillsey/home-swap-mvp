# Story 3.2: Filter Search by Date Range

Status: done

## Story

As a **member**,
I want **to filter search results by my travel dates**,
So that **I only see homes available when I need them**.

## Acceptance Criteria

1. **Given** I am using the search bar
   **When** I click on the date field
   **Then** I see a date range picker

2. **Given** I am selecting dates
   **When** I click a start date and end date
   **Then** my date range is displayed in the search bar

3. **Given** I have selected location and dates
   **When** I submit the search
   **Then** results show ONLY homes with availability matching my dates

## Tasks / Subtasks

- [x] Task 1: Add Date Inputs to SearchBar
  - [x] Add start date and end date inputs
  - [x] Native HTML date inputs with min date validation
  - [x] Pass dates to search query

- [x] Task 2: Update Search Query for Date Filtering
  - [x] Add startDate and endDate to search.homes input
  - [x] Filter by availability periods that contain the requested dates
  - [x] Only return homes with matching availability

- [x] Task 3: Display Date Range in Results
  - [x] Show selected date range in results count

- [x] Task 4: Verify Build
  - [x] Run `pnpm build` - passes
