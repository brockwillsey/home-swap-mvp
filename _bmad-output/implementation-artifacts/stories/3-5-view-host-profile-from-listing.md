# Story 3.5: View Host Profile from Listing

Status: done

## Story

As a **member**,
I want **to see the host's profile from a listing page**,
So that **I can learn about who I'll be exchanging with**.

## Acceptance Criteria

1. **Given** I am on a listing detail page
   **When** I view the host section
   **Then** I see: host photo, name, member since date, brief bio

2. **Given** I want to learn more about the host
   **When** I click on the host's name or photo
   **Then** I am taken to their full member profile page

3. **Given** the host has multiple listings
   **When** I view their profile from a listing
   **Then** I can see count of their other listed homes

## Tasks / Subtasks

- [x] Task 1: Create Host Section on Listing Detail
  - [x] Add host card to listing detail sidebar
  - [x] Show host photo, name, member since date
  - [x] Show bio preview (line-clamped)
  - [x] Show creative interests

- [x] Task 2: Add Link to Full Profile
  - [x] Link host name/photo to /members/[id]
  - [x] Add "View Full Profile" button

- [x] Task 3: Show Other Listings Count
  - [x] Query count of host's other active listings
  - [x] Display count in host card

- [x] Task 4: Verify Build
  - [x] Run `pnpm build` - passes
