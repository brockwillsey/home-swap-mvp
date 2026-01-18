---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
date: 2026-01-17
author: Art Res
project: home-swap-mvp
---

# home-swap-mvp - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for home-swap-mvp, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Member Management (FR1-8):**
- FR1: Visitors can submit a membership application with personal information, bio, photo, and reason for joining
- FR2: Visitors can upload photos of their home(s) as part of the application
- FR3: Visitors can pay the $300 annual membership fee via Stripe during application
- FR4: Members can view and edit their profile (bio, photo, location, creative interests)
- FR5: Members can view other members' profiles
- FR6: Members can see their membership status and renewal date
- FR7: System sends welcome email upon membership approval
- FR8: System sends rejection email with feedback upon membership denial

**Home Listings (FR9-17):**
- FR9: Members can create a new home listing with title, description, and location (city/region)
- FR10: Members can upload multiple photos for each home listing
- FR11: Members can edit or delete their home listings
- FR12: Members can create multiple home listings (support for second homes)
- FR13: Members can set availability dates for each home listing via calendar interface
- FR14: Members can update availability by adding or removing date ranges
- FR15: Members can set booking mode per listing: "instant book" or "requires approval"
- FR16: Members can specify what exchange types they accept: swap-only, points-only, or both
- FR17: Members can view all their listings in one place

**Search & Discovery (FR18-23):**
- FR18: Members can search for homes by location (city, region, or country)
- FR19: Members can filter search results by date range (check-in and check-out dates)
- FR20: Members can view search results showing available homes with photos and summary
- FR21: Members can view detailed home listing pages with full description, all photos, and availability calendar
- FR22: Members can see the host's profile from a listing page
- FR23: System displays only homes with availability matching the selected dates

**Booking System (FR24-34):**
- FR24: Members can request a booking for specific dates on any available listing
- FR25: Members can choose booking type when requesting: direct swap or points exchange
- FR26: Members can propose a swap offer (their home availability in exchange for host's)
- FR27: Hosts receive notification when a booking request is submitted for their listing
- FR28: Hosts can approve booking requests for listings set to "requires approval"
- FR29: Hosts can decline booking requests with optional message
- FR30: System automatically confirms bookings for "instant book" listings
- FR31: Members can view all their bookings (as guest and as host) with status
- FR32: Members can cancel a confirmed booking (with appropriate notice)
- FR33: System sends confirmation emails for approved/confirmed bookings
- FR34: System sends notification emails for declined bookings

**Points System (FR35-39):**
- FR35: Members can view their current points balance
- FR36: System awards points to hosts when a guest completes a stay (based on nights)
- FR37: System deducts points from guests when booking with points
- FR38: Members can view their points transaction history
- FR39: System prevents booking if member has insufficient points (for points bookings)

**Messaging (FR40-45):**
- FR40: Members can send direct messages to other members
- FR41: Members can view conversation threads with each member they've messaged
- FR42: Members receive real-time notifications for new messages
- FR43: Members can message hosts before booking (pre-booking inquiries)
- FR44: Members can message to coordinate arrival details after booking confirmation
- FR45: System displays unread message count/indicator

**Admin Management (FR46-53):**
- FR46: Admins can view a list of pending membership applications
- FR47: Admins can view full application details including submitted photos and bio
- FR48: Admins can approve membership applications
- FR49: Admins can reject membership applications with feedback message
- FR50: Admins can request additional information from applicants
- FR51: System sends appropriate email to applicant based on admin decision
- FR52: Admins can view list of all members
- FR53: Admins can view platform activity (bookings, new listings)

### NonFunctional Requirements

**Performance (NFR1-6):**
- NFR1: Page Load Time < 3 seconds initial load
- NFR2: Time to Interactive < 4 seconds
- NFR3: Messaging Delivery < 2 seconds end-to-end
- NFR4: Search Results < 2 seconds to display
- NFR5: Image Loading - Progressive loading for galleries
- NFR6: Calendar Rendering < 1 second to display/update

**Security (NFR7-13):**
- NFR7: Data Encryption - All data encrypted in transit (HTTPS/TLS 1.3) and at rest
- NFR8: Authentication - Secure session management with appropriate timeout
- NFR9: Payment Security - PCI-DSS compliance via Stripe (no card data stored locally)
- NFR10: Password Security - Passwords hashed with modern algorithm (bcrypt/argon2)
- NFR11: Input Validation - All user inputs validated and sanitized to prevent injection
- NFR12: Photo Privacy - Member photos and home photos only visible to authenticated members
- NFR13: Admin Access - Admin actions logged for audit trail

**Reliability (NFR14-17):**
- NFR14: Core Flow Uptime - 99.5% for booking and payment
- NFR15: Data Durability - No data loss for bookings, payments, messages
- NFR16: Graceful Degradation - Non-critical features can fail without blocking core flows
- NFR17: Error Handling - User-friendly error messages; no exposed stack traces

**Accessibility (NFR18-22):**
- NFR18: WCAG Compliance - WCAG 2.1 Level AA
- NFR19: Keyboard Navigation - All core flows completable via keyboard
- NFR20: Screen Reader Support - Semantic HTML and ARIA labels for listings, calendar, forms
- NFR21: Color Contrast - Minimum 4.5:1 contrast ratio for text
- NFR22: Form Accessibility - All form fields properly labeled with error messages

**Integration (NFR23-26):**
- NFR23: Stripe Integration - Reliable payment processing with webhook handling
- NFR24: Email Delivery - Transactional emails delivered within 5 minutes
- NFR25: Image Storage - Cloud storage with CDN for fast global photo delivery
- NFR26: API Resilience - Graceful handling of third-party API failures

**Scalability (NFR27-29):**
- NFR27: Concurrent Users - Support 50 concurrent users
- NFR28: Data Growth - Support 50 members, 100 listings, 500 photos
- NFR29: Architecture - Stateless design to enable future horizontal scaling

### Additional Requirements

**From Architecture Document:**
- **STARTER TEMPLATE**: T3 Stack (create-t3-app v7.40.0) - Next.js 15 + tRPC + Prisma + NextAuth + Tailwind
- Database: PostgreSQL via Neon (serverless, free tier)
- Authentication: Magic Link (passwordless) via NextAuth + Resend
- Real-time: Pusher Channels (200K messages/day free tier)
- Image Storage: Cloudinary (25GB free, auto-optimization)
- Email: Resend (3,000 emails/month free)
- Hosting: Vercel (optimized for Next.js)
- UI Components: shadcn/ui (Radix primitives, accessible)
- Validation: Zod (shared client/server schemas)
- State Management: tRPC + React Query (server state), React useState (client state)
- Forms: React Hook Form + Zod resolver

**From UX Design Document:**
- Mobile-first responsive design (320px-767px priority)
- Design system: Tailwind CSS + shadcn/ui
- Color system: Forest Green (#2C5545) primary, Gold (#C4A77D) accent, Warm White (#FAFAF9) background
- Typography: Inter font family, specific type scale
- Custom components required: Listing Card, Points Balance Display, Availability Calendar, Chat Message Bubble, Booking Request Card, Search Bar
- Minimum 44px touch targets
- 12px border-radius on cards
- Soft shadows (shadow-md)
- Bottom tab navigation on mobile (Home, Search, Trips, Messages, Profile)
- Toast notifications for feedback
- Skeleton loading states
- Empty states with action buttons

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Submit membership application |
| FR2 | Epic 1 | Upload home photos in application |
| FR3 | Epic 1 | Pay $300 membership via Stripe |
| FR4 | Epic 1 | View and edit profile |
| FR5 | Epic 1 | View other members' profiles |
| FR6 | Epic 1 | See membership status and renewal |
| FR7 | Epic 1 | Welcome email on approval |
| FR8 | Epic 1 | Rejection email with feedback |
| FR9 | Epic 2 | Create home listing |
| FR10 | Epic 2 | Upload multiple photos |
| FR11 | Epic 2 | Edit or delete listings |
| FR12 | Epic 2 | Multiple home listings |
| FR13 | Epic 2 | Set availability via calendar |
| FR14 | Epic 2 | Update availability ranges |
| FR15 | Epic 2 | Set booking mode |
| FR16 | Epic 2 | Specify exchange types |
| FR17 | Epic 2 | View all listings |
| FR18 | Epic 3 | Search by location |
| FR19 | Epic 3 | Filter by date range |
| FR20 | Epic 3 | View search results |
| FR21 | Epic 3 | View listing detail |
| FR22 | Epic 3 | See host profile from listing |
| FR23 | Epic 3 | Show only available homes |
| FR24 | Epic 4 | Request booking for dates |
| FR25 | Epic 4 | Choose booking type |
| FR26 | Epic 4 | Propose swap offer |
| FR27 | Epic 4 | Host receives notification |
| FR28 | Epic 4 | Host approves requests |
| FR29 | Epic 4 | Host declines with message |
| FR30 | Epic 4 | Auto-confirm instant book |
| FR31 | Epic 4 | View all bookings |
| FR32 | Epic 4 | Cancel confirmed booking |
| FR33 | Epic 4 | Confirmation emails |
| FR34 | Epic 4 | Declined booking emails |
| FR35 | Epic 5 | View points balance |
| FR36 | Epic 5 | Award points on hosting |
| FR37 | Epic 5 | Deduct points on booking |
| FR38 | Epic 5 | View transaction history |
| FR39 | Epic 5 | Prevent insufficient balance |
| FR40 | Epic 6 | Send direct messages |
| FR41 | Epic 6 | View conversation threads |
| FR42 | Epic 6 | Real-time notifications |
| FR43 | Epic 6 | Pre-booking inquiries |
| FR44 | Epic 6 | Post-booking coordination |
| FR45 | Epic 6 | Unread message indicator |
| FR46 | Epic 7 | View pending applications |
| FR47 | Epic 7 | View application details |
| FR48 | Epic 7 | Approve applications |
| FR49 | Epic 7 | Reject with feedback |
| FR50 | Epic 7 | Request additional info |
| FR51 | Epic 7 | Send decision emails |
| FR52 | Epic 7 | View all members |
| FR53 | Epic 7 | View platform activity |

## Epic List

### Epic 1: Member Onboarding & Identity
Members can join the Art Res community, complete their profile, and establish their trusted identity.

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8

**Implementation Notes:**
- Story 1.1 initializes T3 Stack project (Architecture requirement)
- Includes Stripe integration for $300 membership payment
- Magic Link authentication via NextAuth + Resend
- Profile management with photo upload via Cloudinary

---

### Epic 2: Home Listing & Availability
Members can list their homes with photos, descriptions, and manage availability calendars for each property.

**FRs Covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17

**Implementation Notes:**
- Cloudinary integration for photo uploads
- Availability Calendar custom component (UX spec)
- Support for multiple homes per member
- Booking mode settings (instant book vs. requires approval)

---

### Epic 3: Search & Discovery
Members can find available homes matching their travel destinations and dates.

**FRs Covered:** FR18, FR19, FR20, FR21, FR22, FR23

**Implementation Notes:**
- Search Bar custom component (UX spec)
- Listing Card component for results
- Date range filtering shows only available homes
- Host profile visible from listing detail

---

### Epic 4: Booking & Exchange
Members can request and confirm bookings, whether through instant book or host approval, using points or direct swaps.

**FRs Covered:** FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR34

**Implementation Notes:**
- Two booking types: points exchange and direct swap
- Instant book vs. requires approval flows
- Booking Request Card component (UX spec)
- Email notifications via Resend

---

### Epic 5: Points Economy
Members can view their points balance, earn points by hosting, and spend points on bookings.

**FRs Covered:** FR35, FR36, FR37, FR38, FR39

**Implementation Notes:**
- Points Balance Display component (UX spec)
- Atomic transactions for earn/spend operations
- Transaction history view
- Balance validation before booking

---

### Epic 6: Member Communication
Members can message each other for coordination, community building, and pre/post-booking discussions.

**FRs Covered:** FR40, FR41, FR42, FR43, FR44, FR45

**Implementation Notes:**
- Pusher integration for real-time messaging
- Chat Message Bubble component (UX spec)
- Unread count/indicator in navigation
- Conversation threads

---

### Epic 7: Community Curation (Admin)
Admins can review applications, manage members, and maintain community quality through curation.

**FRs Covered:** FR46, FR47, FR48, FR49, FR50, FR51, FR52, FR53

**Implementation Notes:**
- Admin dashboard with pending applications
- Approve/Reject/Request Info actions
- Automated emails for each decision
- Member list and activity overview

---

## Epic 1: Member Onboarding & Identity

### Story 1.1: Initialize Project Foundation

As a **developer**,
I want **a fully configured T3 Stack project with all integrations ready**,
So that **I can build features on a solid, consistent foundation**.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** the project is initialized with `pnpm create t3-app@latest`
**Then** the following are configured:
- Next.js 15 with App Router
- tRPC with React Query
- Prisma with PostgreSQL (Neon)
- NextAuth.js for authentication
- Tailwind CSS v4
**And** shadcn/ui is initialized with Art Res design tokens
**And** the project builds without errors
**And** environment variables are documented in `.env.example`

---

### Story 1.2: Implement Magic Link Authentication

As a **visitor**,
I want **to sign in using a magic link sent to my email**,
So that **I can securely access my account without remembering a password**.

**Acceptance Criteria:**

**Given** I am on the sign-in page
**When** I enter my email address and submit
**Then** a magic link is sent to my email via Resend
**And** I see a confirmation message: "Check your email for a sign-in link"

**Given** I have received a magic link email
**When** I click the link within 10 minutes
**Then** I am authenticated and redirected to my dashboard
**And** a secure session is created

**Given** I click an expired magic link
**When** more than 10 minutes have passed
**Then** I see an error message and can request a new link

---

### Story 1.3: Build Member Application Form

As a **visitor**,
I want **to apply for Art Res membership by providing my information**,
So that **I can join the curated community**.

**Acceptance Criteria:**

**Given** I am on the application page
**When** I view the form
**Then** I see fields for: name, email, bio, location, creative interests, reason for joining
**And** I see a required profile photo upload field

**Given** I am filling out the application
**When** I upload a profile photo
**Then** the photo is uploaded to Cloudinary
**And** I see a preview of my uploaded photo

**Given** I have filled all required fields
**When** I submit the application
**Then** my application is saved with status "pending"
**And** I am directed to the payment step

**Given** I leave required fields empty
**When** I try to submit
**Then** I see validation errors for each missing field

---

### Story 1.4: Upload Home Photos in Application

As a **visitor applying for membership**,
I want **to upload photos of my home as part of my application**,
So that **admins can assess my property for community fit**.

**Acceptance Criteria:**

**Given** I am on the application form
**When** I reach the home photos section
**Then** I see an upload area for multiple photos (minimum 3 required)

**Given** I am uploading home photos
**When** I select images from my device
**Then** photos are uploaded to Cloudinary with optimization
**And** I see previews of each uploaded photo
**And** I can remove photos before submission

**Given** I have uploaded fewer than 3 photos
**When** I try to proceed
**Then** I see a validation message requiring at least 3 photos

---

### Story 1.5: Process Membership Payment

As a **visitor completing my application**,
I want **to pay the $300 annual membership fee**,
So that **my application can be reviewed**.

**Acceptance Criteria:**

**Given** I have completed the application form
**When** I proceed to payment
**Then** I see a Stripe checkout for $300 annual membership

**Given** I complete payment successfully
**When** Stripe confirms the transaction
**Then** my application status changes to "submitted"
**And** I receive a confirmation email
**And** I see a "Application Submitted" confirmation page

**Given** my payment fails
**When** Stripe returns an error
**Then** I see an error message with option to retry
**And** my application remains in "pending" status

**Given** I am rejected after paying
**When** an admin rejects my application
**Then** I receive an automatic refund via Stripe

---

### Story 1.6: Create Member Profile Management

As a **member**,
I want **to view and edit my profile information**,
So that **I can keep my community presence up to date**.

**Acceptance Criteria:**

**Given** I am a logged-in member
**When** I navigate to my profile page
**Then** I see my current profile information: name, bio, photo, location, creative interests

**Given** I am viewing my profile
**When** I click "Edit Profile"
**Then** I can modify all profile fields
**And** I can upload a new profile photo

**Given** I have made changes to my profile
**When** I save the changes
**Then** my profile is updated
**And** I see a success confirmation toast

---

### Story 1.7: View Other Member Profiles

As a **member**,
I want **to view other members' profiles**,
So that **I can learn about potential exchange partners and build trust**.

**Acceptance Criteria:**

**Given** I am a logged-in member
**When** I view another member's profile page
**Then** I see their: name, bio, photo, location, creative interests, member since date
**And** I see their listed homes (if any)

**Given** I am not logged in
**When** I try to access a member profile
**Then** I am redirected to the sign-in page

---

### Story 1.8: Display Membership Status

As a **member**,
I want **to see my membership status and renewal date**,
So that **I know when my membership expires**.

**Acceptance Criteria:**

**Given** I am on my profile or dashboard
**When** I view my membership section
**Then** I see my membership status (active/expired)
**And** I see my membership start date
**And** I see my renewal date (1 year from start)

**Given** my membership expires in 30 days
**When** I view my dashboard
**Then** I see a renewal reminder

---

### Story 1.9: Send Application Decision Emails

As a **system**,
I want **to automatically send emails based on application decisions**,
So that **applicants are informed of their status**.

**Acceptance Criteria:**

**Given** an admin approves an application
**When** the approval is saved
**Then** a welcome email is sent via Resend
**And** the email includes: welcome message, login link, getting started guide

**Given** an admin rejects an application
**When** the rejection is saved with feedback
**Then** a rejection email is sent via Resend
**And** the email includes: the admin's feedback, refund confirmation

**Given** an admin requests more information
**When** the request is saved
**Then** an email is sent asking for the specific information needed

---

## Epic 2: Home Listing & Availability

### Story 2.1: Create Home Listing with Basic Info

As a **member**,
I want **to create a listing for my home with title, description, and location**,
So that **other members can discover my property for exchanges**.

**Acceptance Criteria:**

**Given** I am a logged-in member
**When** I click "Add Home" from my dashboard
**Then** I see a listing creation form

**Given** I am on the listing form
**When** I fill in title, description, and location (city/region)
**Then** I can preview my listing before proceeding

**Given** I have entered valid listing details
**When** I save the listing
**Then** the home is created with status "draft"
**And** I am directed to add photos

**Given** I enter a title longer than 100 characters
**When** I try to proceed
**Then** I see a validation error

---

### Story 2.2: Upload Multiple Photos for Listing

As a **member**,
I want **to upload multiple photos for my home listing**,
So that **guests can see what my home looks like**.

**Acceptance Criteria:**

**Given** I am creating or editing a listing
**When** I reach the photos step
**Then** I see an upload area supporting multiple images

**Given** I select photos to upload
**When** the upload completes
**Then** photos are stored in Cloudinary with optimization
**And** I see previews with drag-to-reorder capability
**And** I can set one photo as the primary/cover image

**Given** I have uploaded photos
**When** I want to remove one
**Then** I can click delete on any photo
**And** the photo is removed from the listing

**Given** I try to publish with fewer than 3 photos
**When** I click publish
**Then** I see a validation requiring at least 3 photos

---

### Story 2.3: Edit and Delete Home Listings

As a **member**,
I want **to edit or delete my home listings**,
So that **I can keep my listings accurate or remove them**.

**Acceptance Criteria:**

**Given** I am viewing my listing
**When** I click "Edit"
**Then** I can modify title, description, location, and photos

**Given** I have made edits to my listing
**When** I save changes
**Then** the listing is updated
**And** I see a success confirmation

**Given** I want to delete a listing
**When** I click "Delete" and confirm
**Then** the listing is soft-deleted (not shown publicly)
**And** any pending bookings show a warning

**Given** I have active confirmed bookings
**When** I try to delete the listing
**Then** I see a warning about existing bookings
**And** I must cancel bookings first or wait until they complete

---

### Story 2.4: Support Multiple Home Listings

As a **member with multiple properties**,
I want **to create listings for each of my homes**,
So that **I can offer multiple locations for exchange**.

**Acceptance Criteria:**

**Given** I am a member with one listing
**When** I click "Add Another Home"
**Then** I can create a new listing independent of my first

**Given** I have multiple listings
**When** I view my listings dashboard
**Then** I see all my homes listed with their status
**And** each listing has its own availability calendar

**Given** I have 5 listings
**When** I try to add another
**Then** I can add it (no artificial limit for MVP)

---

### Story 2.5: Manage Availability Calendar

As a **member**,
I want **to set and update availability dates for my home**,
So that **guests know when my home is available for booking**.

**Acceptance Criteria:**

**Given** I am editing my listing
**When** I navigate to the availability section
**Then** I see a calendar interface (Availability Calendar component)

**Given** I am on the availability calendar
**When** I click and drag to select a date range
**Then** those dates are marked as available
**And** available dates show in green

**Given** I have set available dates
**When** I click on an available range
**Then** I can remove that availability
**And** the dates return to unavailable (gray)

**Given** I add a new availability range
**When** I save the calendar
**Then** the availability is persisted to the database
**And** guests can now find my home for those dates

---

### Story 2.6: Configure Booking Mode

As a **member**,
I want **to choose between instant book and requires approval for my listing**,
So that **I can control how guests book my home**.

**Acceptance Criteria:**

**Given** I am editing my listing settings
**When** I view the booking mode section
**Then** I see two options: "Instant Book" and "Requires Approval"

**Given** I select "Instant Book"
**When** I save the setting
**Then** guests can book without my confirmation
**And** my listing shows an "Instant Book" badge

**Given** I select "Requires Approval"
**When** I save the setting
**Then** booking requests require my approval
**And** I receive notifications for pending requests

**Given** I change from Instant Book to Requires Approval
**When** I have pending instant bookings
**Then** existing bookings are not affected
**And** only new requests require approval

---

### Story 2.7: Set Exchange Type Preferences

As a **member**,
I want **to specify what exchange types I accept for my listing**,
So that **I can control how guests can book my home**.

**Acceptance Criteria:**

**Given** I am editing my listing settings
**When** I view the exchange types section
**Then** I see options: "Accept Swaps", "Accept Points", or "Both"

**Given** I select "Swaps Only"
**When** a guest tries to book with points
**Then** they see a message that this listing only accepts swaps

**Given** I select "Points Only"
**When** a guest tries to propose a swap
**Then** they see a message that this listing only accepts points

**Given** I select "Both"
**When** guests view my listing
**Then** they can choose either booking type

---

### Story 2.8: View All My Listings Dashboard

As a **member**,
I want **to see all my home listings in one place**,
So that **I can manage my properties efficiently**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to "My Listings"
**Then** I see a grid/list of all my home listings

**Given** I view my listings dashboard
**When** I see each listing card
**Then** it shows: cover photo, title, location, booking mode badge, availability status

**Given** I have no listings
**When** I view My Listings
**Then** I see an empty state with "Add Your First Home" button

**Given** I click on a listing card
**When** the detail opens
**Then** I can quickly edit or view full details

---

## Epic 3: Search & Discovery

### Story 3.1: Search Homes by Location

As a **member**,
I want **to search for homes by location**,
So that **I can find places to stay in my desired destination**.

**Acceptance Criteria:**

**Given** I am on the home page or search page
**When** I view the search bar
**Then** I see a location input field with autocomplete

**Given** I start typing a location
**When** I enter "Mexico"
**Then** I see autocomplete suggestions (Mexico City, Bacalar, Oaxaca, etc.)

**Given** I select a location from autocomplete
**When** I submit the search
**Then** I see results for homes in that location
**And** the search completes in under 2 seconds (NFR4)

**Given** I search for a location with no listings
**When** results load
**Then** I see an empty state: "No homes available in [location]"
**And** I see suggestions for nearby locations or "Try different dates"

---

### Story 3.2: Filter Search by Date Range

As a **member**,
I want **to filter search results by my travel dates**,
So that **I only see homes available when I need them**.

**Acceptance Criteria:**

**Given** I am using the search bar
**When** I click on the date field
**Then** I see a date range picker calendar

**Given** I am selecting dates
**When** I click a start date and end date
**Then** my date range is displayed in the search bar
**And** the calendar shows my selected range highlighted

**Given** I have selected location and dates
**When** I submit the search
**Then** results show ONLY homes with availability matching my dates
**And** unavailable homes are not shown (FR23)

**Given** I change my date range
**When** I update the dates
**Then** results automatically refresh with new availability

---

### Story 3.3: View Search Results Grid

As a **member**,
I want **to view search results showing available homes**,
So that **I can browse and compare options**.

**Acceptance Criteria:**

**Given** I have submitted a search
**When** results load
**Then** I see a grid of Listing Card components

**Given** I view the results grid
**When** I look at each listing card
**Then** I see: cover photo, title, location, host name, booking mode badge
**And** photos load progressively (NFR5)

**Given** there are many results
**When** I scroll down
**Then** additional results load (infinite scroll or pagination)

**Given** I am on mobile
**When** I view results
**Then** I see a single-column card list
**And** touch targets are at least 44px

---

### Story 3.4: View Listing Detail Page

As a **member**,
I want **to view a detailed listing page**,
So that **I can see full information before booking**.

**Acceptance Criteria:**

**Given** I click on a listing card from search results
**When** the detail page loads
**Then** I see: all photos in a gallery, full description, location, amenities

**Given** I am on the listing detail page
**When** I view the photos section
**Then** I can browse through all photos in a carousel
**And** I can open photos in a full-screen lightbox

**Given** I am on the listing detail page
**When** I view the availability section
**Then** I see the availability calendar showing available dates
**And** I can see the booking mode (Instant Book or Requires Approval)

**Given** I am on mobile
**When** I view the listing
**Then** the layout is single-column and touch-friendly

---

### Story 3.5: View Host Profile from Listing

As a **member**,
I want **to see the host's profile from a listing page**,
So that **I can learn about who I'll be exchanging with**.

**Acceptance Criteria:**

**Given** I am on a listing detail page
**When** I view the host section
**Then** I see: host photo, name, member since date, brief bio

**Given** I want to learn more about the host
**When** I click on the host's name or photo
**Then** I am taken to their full member profile page

**Given** the host has multiple listings
**When** I view their profile from a listing
**Then** I can see their other listed homes

---

## Epic 4: Booking & Exchange

### Story 4.1: Request Booking for Specific Dates

As a **member**,
I want **to request a booking for specific dates on an available listing**,
So that **I can secure my stay**.

**Acceptance Criteria:**

**Given** I am on a listing detail page
**When** I select dates from the availability calendar
**Then** the dates are highlighted and a "Book" button appears

**Given** I have selected valid available dates
**When** I click "Book"
**Then** I am taken to the booking flow
**And** I see a summary of: listing, dates, number of nights

**Given** I try to select unavailable dates
**When** I click on grayed-out dates
**Then** nothing happens (dates are not selectable)

**Given** my selected dates overlap with another booking
**When** I submit the request
**Then** I see an error: "These dates are no longer available"

---

### Story 4.2: Choose Booking Type

As a **member**,
I want **to choose between points exchange or direct swap when booking**,
So that **I can use the exchange method that works best for me**.

**Acceptance Criteria:**

**Given** I am in the booking flow
**When** I reach the exchange type step
**Then** I see options based on listing settings:
- Points Exchange (if host accepts points)
- Direct Swap (if host accepts swaps)

**Given** I select "Points Exchange"
**When** I proceed
**Then** I see my current points balance
**And** I see the points required for this booking

**Given** I select "Direct Swap"
**When** I proceed
**Then** I am prompted to select which of my homes to offer
**And** I can propose dates for the swap

---

### Story 4.3: Propose Swap Offer

As a **member**,
I want **to propose a swap offer with my home availability**,
So that **I can exchange stays without using points**.

**Acceptance Criteria:**

**Given** I am booking with "Direct Swap"
**When** I view my homes
**Then** I see a list of my active listings

**Given** I select a home to offer
**When** I proceed
**Then** I see a calendar to propose when the host can stay at my home

**Given** I have selected my home and proposed dates
**When** I submit the swap offer
**Then** the booking request is created with type "swap"
**And** the host sees both: my requested dates AND my offered dates

**Given** I have no homes listed
**When** I try to select "Direct Swap"
**Then** I see a message: "You need to list a home to offer swaps"
**And** a link to "Add Your Home"

---

### Story 4.4: Receive Booking Request Notification

As a **host**,
I want **to receive a notification when someone requests to book my home**,
So that **I can respond promptly**.

**Acceptance Criteria:**

**Given** a guest submits a booking request for my listing
**When** the request is saved
**Then** I receive an in-app notification
**And** I receive an email notification via Resend

**Given** I view the notification
**When** I click on it
**Then** I am taken to the booking request details

**Given** I am logged in
**When** I have pending requests
**Then** I see a badge count on the "Trips" navigation item

---

### Story 4.5: Host Approves Booking Request

As a **host**,
I want **to approve booking requests for my listing**,
So that **guests can confirm their stay**.

**Acceptance Criteria:**

**Given** I have a pending booking request
**When** I view the request details
**Then** I see: guest profile, requested dates, exchange type (points/swap)

**Given** I am reviewing a swap request
**When** I view the details
**Then** I see the guest's offered home and proposed dates for my visit

**Given** I want to approve the request
**When** I click "Approve"
**Then** the booking status changes to "confirmed"
**And** the dates are blocked on my availability calendar
**And** the guest is notified

**Given** I approve a points booking
**When** the booking is confirmed
**Then** points are deducted from the guest's balance

---

### Story 4.6: Host Declines Booking Request

As a **host**,
I want **to decline booking requests with an optional message**,
So that **I can politely turn down requests that don't work for me**.

**Acceptance Criteria:**

**Given** I have a pending booking request
**When** I click "Decline"
**Then** I see an optional message field

**Given** I am declining a request
**When** I add a message like "Sorry, I'll be hosting family that week"
**Then** the message is included in the decline notification

**Given** I confirm the decline
**When** the action is saved
**Then** the booking status changes to "declined"
**And** the guest receives a notification with my message
**And** the dates remain available for other guests

---

### Story 4.7: Auto-Confirm Instant Book Listings

As a **guest**,
I want **my booking to be automatically confirmed for instant book listings**,
So that **I don't have to wait for host approval**.

**Acceptance Criteria:**

**Given** a listing is set to "Instant Book"
**When** I complete the booking flow
**Then** the booking is immediately confirmed (no pending state)
**And** I see "Booking Confirmed!" success screen

**Given** I instant-book with points
**When** the booking confirms
**Then** points are immediately deducted from my balance

**Given** I instant-book with a swap offer
**When** the booking confirms
**Then** the swap is recorded
**And** the host is notified to review the offered dates

**Given** the booking is confirmed
**When** confirmation happens
**Then** dates are immediately blocked on host's calendar

---

### Story 4.8: View All My Bookings

As a **member**,
I want **to view all my bookings as both guest and host**,
So that **I can track my upcoming and past stays**.

**Acceptance Criteria:**

**Given** I navigate to "My Trips"
**When** the page loads
**Then** I see tabs: "My Stays" (as guest) and "My Hosting" (as host)

**Given** I view "My Stays"
**When** I see the list
**Then** I see bookings with: listing photo, title, dates, status (pending/confirmed/completed/cancelled)

**Given** I view "My Hosting"
**When** I see the list
**Then** I see bookings at my homes with: guest photo, name, dates, status

**Given** I click on a booking
**When** the detail opens
**Then** I see full booking details and can message the other party

---

### Story 4.9: Cancel Confirmed Booking

As a **member**,
I want **to cancel a confirmed booking**,
So that **I can change plans when necessary**.

**Acceptance Criteria:**

**Given** I have a confirmed booking as a guest
**When** I click "Cancel Booking"
**Then** I see a confirmation dialog with cancellation notice

**Given** I confirm the cancellation
**When** the cancellation is processed
**Then** the booking status changes to "cancelled"
**And** the host is notified
**And** the dates become available again

**Given** I cancelled a points booking
**When** the cancellation is processed
**Then** points are refunded to my balance (for MVP, full refund)

**Given** I am a host cancelling
**When** I cancel a booking at my home
**Then** the guest is notified
**And** their points are refunded (if points booking)

---

### Story 4.10: Send Booking Confirmation Emails

As a **system**,
I want **to send confirmation emails for confirmed bookings**,
So that **both parties have a record of their booking**.

**Acceptance Criteria:**

**Given** a booking is confirmed (approved or instant book)
**When** the confirmation is saved
**Then** an email is sent to the guest via Resend
**And** an email is sent to the host via Resend

**Given** the confirmation email
**When** the guest receives it
**Then** it includes: listing details, dates, host contact, address/access info

**Given** the confirmation email
**When** the host receives it
**Then** it includes: guest details, dates, exchange type, guest contact

---

### Story 4.11: Send Declined Booking Emails

As a **system**,
I want **to send notification emails for declined bookings**,
So that **guests are informed when their request is declined**.

**Acceptance Criteria:**

**Given** a host declines a booking request
**When** the decline is saved
**Then** an email is sent to the guest via Resend

**Given** the decline email
**When** the guest receives it
**Then** it includes: listing name, requested dates, host's message (if provided)
**And** a link to "Continue Searching"

---

## Epic 5: Points Economy

### Story 5.1: View Points Balance

As a **member**,
I want **to see my current points balance**,
So that **I know how many nights I can book**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I view the header/navigation
**Then** I see my points balance displayed (Points Balance Display component)

**Given** I am on my profile or dashboard
**When** I view the points section
**Then** I see my total points balance prominently displayed

**Given** I have 0 points
**When** I view my balance
**Then** I see "0 points" with a message about how to earn points

**Given** I am on mobile
**When** I view the navigation
**Then** my points balance is visible in the profile tab or header

---

### Story 5.2: Award Points When Hosting

As a **host**,
I want **to earn points when a guest completes a stay at my home**,
So that **I can use those points for my own travels**.

**Acceptance Criteria:**

**Given** a guest has a confirmed booking at my home
**When** the checkout date passes
**Then** points are automatically awarded to my account
**And** points awarded = number of nights stayed (1 night = 1 point for MVP)

**Given** points are awarded
**When** the transaction completes
**Then** I receive a notification: "You earned X points for hosting [Guest Name]"
**And** the transaction is recorded in my history

**Given** the guest cancels before the stay
**When** the booking is cancelled
**Then** no points are awarded (points only for completed stays)

**Given** I am the host completing a swap
**When** the guest's stay completes
**Then** points are NOT awarded (swaps don't generate points, they're reciprocal)

---

### Story 5.3: Deduct Points When Booking

As a **guest**,
I want **points deducted when I book with points**,
So that **the exchange is completed**.

**Acceptance Criteria:**

**Given** I am booking with points
**When** the booking is confirmed
**Then** points are deducted from my balance
**And** points deducted = number of nights booked

**Given** I book an instant-book listing with points
**When** I complete the booking flow
**Then** points are immediately deducted

**Given** I book a requires-approval listing with points
**When** the host approves
**Then** points are deducted at approval time

**Given** I cancel a points booking
**When** the cancellation is processed
**Then** points are refunded to my balance

---

### Story 5.4: View Points Transaction History

As a **member**,
I want **to view my points transaction history**,
So that **I can see how I earned and spent my points**.

**Acceptance Criteria:**

**Given** I navigate to my points section
**When** I click "View History"
**Then** I see a chronological list of all transactions

**Given** I view transaction history
**When** I see each transaction
**Then** it shows: date, type (earned/spent/refunded), amount, description

**Given** I earned points from hosting
**When** I view that transaction
**Then** it shows: "+5 points - Hosted [Guest Name] at [Listing Name]"

**Given** I spent points booking
**When** I view that transaction
**Then** it shows: "-7 points - Stayed at [Listing Name] in [Location]"

**Given** I received a refund
**When** I view that transaction
**Then** it shows: "+3 points - Refund: Cancelled booking at [Listing Name]"

---

### Story 5.5: Prevent Booking with Insufficient Points

As a **system**,
I want **to prevent members from booking with points if they have insufficient balance**,
So that **bookings cannot exceed available points**.

**Acceptance Criteria:**

**Given** I am booking with points
**When** I select dates requiring more points than I have
**Then** I see: "You need X points but only have Y"
**And** the "Confirm Booking" button is disabled

**Given** I don't have enough points
**When** I view the error
**Then** I see suggestions: "Host guests to earn points" or "Choose a shorter stay"

**Given** my balance changes while in booking flow
**When** another booking depletes my points
**Then** I see an error at confirmation: "Your points balance has changed"

**Given** I have exactly enough points
**When** I complete the booking
**Then** the booking succeeds and balance becomes 0

---

## Epic 6: Member Communication

### Story 6.1: Send Direct Messages

As a **member**,
I want **to send direct messages to other members**,
So that **I can communicate and coordinate**.

**Acceptance Criteria:**

**Given** I am on another member's profile
**When** I click "Message"
**Then** a chat interface opens with that member

**Given** I am in a chat thread
**When** I type a message and click send
**Then** the message is saved to the database
**And** the message appears in the thread immediately
**And** the message is delivered via Pusher in under 2 seconds (NFR3)

**Given** I send a message
**When** the recipient views their messages
**Then** they see my message with timestamp

**Given** I send an empty message
**When** I click send
**Then** nothing happens (empty messages not allowed)

---

### Story 6.2: View Conversation Threads

As a **member**,
I want **to view conversation threads with each member I've messaged**,
So that **I can follow our conversation history**.

**Acceptance Criteria:**

**Given** I navigate to "Messages"
**When** the page loads
**Then** I see a list of all my conversations (Conversation List)

**Given** I view the conversation list
**When** I see each conversation
**Then** it shows: member photo, name, last message preview, timestamp

**Given** I click on a conversation
**When** the thread opens
**Then** I see all messages in chronological order
**And** messages show sender, content, and timestamp

**Given** the conversation is long
**When** I scroll up
**Then** older messages load (pagination or infinite scroll)

---

### Story 6.3: Real-time Message Notifications

As a **member**,
I want **to receive real-time notifications for new messages**,
So that **I can respond promptly**.

**Acceptance Criteria:**

**Given** I am logged in with the app open
**When** another member sends me a message
**Then** I receive a real-time notification via Pusher
**And** the notification appears within 2 seconds

**Given** I receive a real-time notification
**When** I am on a different page
**Then** I see a toast notification with message preview
**And** clicking the toast opens the conversation

**Given** I am in the conversation with the sender
**When** they send a message
**Then** it appears in the thread immediately (no refresh needed)

**Given** Pusher connection fails
**When** I load messages
**Then** messages still load via API (graceful degradation - NFR16)

---

### Story 6.4: Pre-booking Inquiries

As a **member**,
I want **to message hosts before booking**,
So that **I can ask questions about their listing**.

**Acceptance Criteria:**

**Given** I am on a listing detail page
**When** I click "Message Host"
**Then** a chat interface opens with the host
**And** the listing context is shown in the thread header

**Given** I send a pre-booking message
**When** the host receives it
**Then** they see it tagged as "Inquiry about [Listing Name]"

**Given** I am a host receiving an inquiry
**When** I view the message
**Then** I see which listing the inquiry is about
**And** I can respond directly

---

### Story 6.5: Post-booking Coordination

As a **member with a confirmed booking**,
I want **to message to coordinate arrival details**,
So that **I know how to access the home**.

**Acceptance Criteria:**

**Given** I have a confirmed booking
**When** I view the booking details
**Then** I see a "Message [Host/Guest]" button

**Given** I click message from a booking
**When** the chat opens
**Then** the booking context is shown (dates, listing)

**Given** I am coordinating arrival
**When** I exchange messages
**Then** messages are associated with the booking
**And** both parties can easily reference the booking details

**Given** the host shares access instructions
**When** I view the conversation
**Then** I can easily find important details (key code, address, etc.)

---

### Story 6.6: Display Unread Message Count

As a **member**,
I want **to see an unread message count**,
So that **I know when I have new messages**.

**Acceptance Criteria:**

**Given** I have unread messages
**When** I view the navigation
**Then** I see a badge with unread count on "Messages"

**Given** I have 5 unread messages
**When** I view the badge
**Then** it shows "5"

**Given** I read a message
**When** I open the conversation
**Then** messages in that thread are marked as read
**And** the unread count decreases

**Given** I have more than 9 unread messages
**When** I view the badge
**Then** it shows "9+" (capped display)

**Given** I have no unread messages
**When** I view the navigation
**Then** no badge is shown

---

## Epic 7: Community Curation (Admin)

### Story 7.1: View Pending Applications List

As an **admin**,
I want **to view a list of pending membership applications**,
So that **I can review and process new applicants**.

**Acceptance Criteria:**

**Given** I am logged in as an admin
**When** I navigate to the Admin Dashboard
**Then** I see a "Pending Applications" section with count

**Given** I view pending applications
**When** the list loads
**Then** I see applications sorted by submission date (oldest first)
**And** each row shows: applicant name, photo, submission date, status

**Given** there are no pending applications
**When** I view the section
**Then** I see "No pending applications" message

**Given** I am not an admin
**When** I try to access the admin dashboard
**Then** I am redirected to the home page with an error

---

### Story 7.2: View Application Details

As an **admin**,
I want **to view full application details including photos and bio**,
So that **I can make an informed approval decision**.

**Acceptance Criteria:**

**Given** I click on a pending application
**When** the detail view opens
**Then** I see: applicant's full profile (name, bio, location, creative interests, reason for joining)

**Given** I am viewing application details
**When** I scroll to photos
**Then** I see: profile photo and all submitted home photos

**Given** I view the photos
**When** I click on a photo
**Then** it opens in a larger view/lightbox

**Given** the applicant provided a reason for joining
**When** I view the application
**Then** I see their reason prominently displayed

---

### Story 7.3: Approve Membership Application

As an **admin**,
I want **to approve membership applications**,
So that **qualified applicants can join the community**.

**Acceptance Criteria:**

**Given** I am viewing an application detail
**When** I click "Approve"
**Then** I see a confirmation dialog

**Given** I confirm approval
**When** the action is saved
**Then** the application status changes to "approved"
**And** the applicant becomes an active member
**And** the action is logged with admin ID and timestamp (NFR13)

**Given** the application is approved
**When** the member logs in
**Then** they have full member access to the platform

---

### Story 7.4: Reject Application with Feedback

As an **admin**,
I want **to reject applications with a feedback message**,
So that **applicants understand why they weren't accepted**.

**Acceptance Criteria:**

**Given** I am viewing an application detail
**When** I click "Reject"
**Then** I see a feedback form with suggested rejection reasons

**Given** I am rejecting an application
**When** I write feedback
**Then** I can select from common reasons or write custom feedback

**Given** I submit the rejection
**When** the action is saved
**Then** the application status changes to "rejected"
**And** the applicant's payment is refunded via Stripe
**And** the action is logged with admin ID, timestamp, and reason (NFR13)

**Given** an application is rejected
**When** the applicant tries to log in
**Then** they see a message that their application was not approved

---

### Story 7.5: Request Additional Information

As an **admin**,
I want **to request more information from applicants**,
So that **I can make a better decision on borderline applications**.

**Acceptance Criteria:**

**Given** I am viewing an application detail
**When** I click "Request More Info"
**Then** I see a form to specify what information is needed

**Given** I submit the request
**When** the action is saved
**Then** the application status changes to "needs_info"
**And** the action is logged (NFR13)

**Given** the applicant responds with more info
**When** they update their application
**Then** the status changes back to "pending"
**And** I am notified of the update

**Given** I view an application that needed info
**When** info has been provided
**Then** I see a badge "Updated" and can review the new information

---

### Story 7.6: Send Application Decision Emails

As a **system**,
I want **to send appropriate emails based on admin decisions**,
So that **applicants are informed of their status**.

**Acceptance Criteria:**

**Given** an admin approves an application
**When** the approval is saved
**Then** a welcome email is sent via Resend within 5 minutes (NFR24)

**Given** an admin rejects an application
**When** the rejection is saved
**Then** a rejection email with feedback is sent
**And** the email includes refund confirmation

**Given** an admin requests more info
**When** the request is saved
**Then** an email is sent asking for the specific information
**And** the email includes a link to update the application

---

### Story 7.7: View All Members List

As an **admin**,
I want **to view a list of all members**,
So that **I can manage the community**.

**Acceptance Criteria:**

**Given** I am on the admin dashboard
**When** I navigate to "Members"
**Then** I see a list of all active members

**Given** I view the members list
**When** I see each member row
**Then** it shows: photo, name, location, member since, number of listings

**Given** I want to find a specific member
**When** I use the search box
**Then** I can search by name or email

**Given** I click on a member
**When** the detail opens
**Then** I see their full profile and can view their listings

---

### Story 7.8: View Platform Activity Dashboard

As an **admin**,
I want **to see platform activity overview**,
So that **I can monitor community health**.

**Acceptance Criteria:**

**Given** I am on the admin dashboard
**When** I view the activity section
**Then** I see key metrics: total members, total listings, recent bookings

**Given** I view recent activity
**When** the list loads
**Then** I see recent events: new members, new listings, completed bookings

**Given** I want to see booking activity
**When** I view the bookings section
**Then** I see: total bookings, bookings this month, completed stays

**Given** I want to track growth
**When** I view the dashboard
**Then** I see: new members this week/month, new listings this week/month

---

## Summary

| Epic | Title | Stories | FRs Covered |
|------|-------|---------|-------------|
| 1 | Member Onboarding & Identity | 9 | FR1-8 + Architecture |
| 2 | Home Listing & Availability | 8 | FR9-17 |
| 3 | Search & Discovery | 5 | FR18-23 |
| 4 | Booking & Exchange | 11 | FR24-34 |
| 5 | Points Economy | 5 | FR35-39 |
| 6 | Member Communication | 6 | FR40-45 |
| 7 | Community Curation (Admin) | 8 | FR46-53 |
| **Total** | | **52 stories** | **53 FRs** |
