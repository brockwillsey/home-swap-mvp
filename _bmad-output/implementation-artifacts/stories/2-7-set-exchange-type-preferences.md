# Story 2.7: Set Exchange Type Preferences

Status: done

## Story

As a **member**,
I want **to specify what exchange types I accept for my listing**,
So that **I can control how guests can book my home**.

## Acceptance Criteria

1. **Given** I am editing my listing settings
   **When** I view the exchange types section
   **Then** I see options: "Accept Swaps", "Accept Points", or "Both"

2. **Given** I select "Swaps Only"
   **When** a guest tries to book with points
   **Then** they see a message that this listing only accepts swaps

3. **Given** I select "Points Only"
   **When** a guest tries to propose a swap
   **Then** they see a message that this listing only accepts points

4. **Given** I select "Both"
   **When** guests view my listing
   **Then** they can choose either booking type

## Tasks / Subtasks

- [x] Task 1: Add Exchange Type tRPC Procedure
  - [x] Add `listing.updateExchangeType` mutation
  - [x] Validate ownership before update
  - [x] Support SWAP_ONLY, POINTS_ONLY, and BOTH enum values

- [x] Task 2: Add Exchange Type to Settings Form
  - [x] Add exchange type selection cards to ListingSettingsForm
  - [x] Show all three options: Both, Swaps Only, Points Only
  - [x] Active state indicator on selected option

- [x] Task 3: Display Exchange Type on Listings Dashboard
  - [x] Show exchange type (Swaps & Points, Swaps Only, Points Only) on listing cards

- [x] Task 4: Verify Build
  - [x] Run `pnpm build` - passes
