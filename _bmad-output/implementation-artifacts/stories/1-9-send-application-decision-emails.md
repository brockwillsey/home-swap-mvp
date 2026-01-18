# Story 1.9: Send Application Decision Emails

Status: done

## Story

As a **system**,
I want **to automatically send emails based on application decisions**,
So that **applicants are informed of their status**.

## Acceptance Criteria

1. **Given** an admin approves an application
   **When** the approval is saved
   **Then** a welcome email is sent via Resend
   **And** the email includes: welcome message, login link, getting started guide

2. **Given** an admin rejects an application
   **When** the rejection is saved with feedback
   **Then** a rejection email is sent via Resend
   **And** the email includes: the admin's feedback, refund confirmation

3. **Given** an admin requests more information
   **When** the request is saved
   **Then** an email is sent asking for the specific information needed

## Tasks / Subtasks

- [x] Task 1: Add Email Templates to Resend Service (AC: #1, #2, #3)
  - [x] Create `sendWelcomeEmail` function with branded template
  - [x] Create `sendRejectionEmail` function with feedback and refund info
  - [x] Create `sendInfoRequestEmail` function

- [x] Task 2: Add Admin Approve Procedure (AC: #1)
  - [x] Create `approve` procedure in application router
  - [x] Update application status to APPROVED
  - [x] Set reviewedAt and reviewedBy
  - [x] Call sendWelcomeEmail function

- [x] Task 3: Update Admin Reject Procedure (AC: #2)
  - [x] Call sendRejectionEmail after rejection is saved
  - [x] Include feedback and refund confirmation in email

- [x] Task 4: Add Admin Request Info Procedure (AC: #3)
  - [x] Create `requestMoreInfo` procedure in application router
  - [x] Update application status to NEEDS_INFO
  - [x] Store admin's request message
  - [x] Call sendInfoRequestEmail function

- [x] Task 5: Add Admin List Pending Procedure
  - [x] Create `listPending` procedure for admin to view applications
  - [x] Return applications sorted by submission date

- [x] Task 6: Verify Build and Types
  - [x] Run `pnpm build` to verify no TypeScript errors

## Technical Notes

### Email Templates
- Use existing Art Res branding from magic link email
- Include proper escaping for user content (XSS prevention)
- Provide both HTML and plain text versions

### Admin Procedures
- All admin procedures use `adminProcedure` (requires ADMIN role)
- Log all admin actions with timestamp and admin ID (NFR13)
- Handle edge cases (application not found, wrong status)

### File List
- `src/lib/services/resend.ts` (modified - add templates)
- `src/server/api/routers/application.ts` (modified - add procedures)

## Dev Notes

- Resend free tier: 3,000 emails/month, 100 emails/day
- Email delivery within 5 minutes (NFR24)
- Use DEFAULT_FROM_EMAIL from existing resend service

## Review Follow-ups

- [ ] [AI-Review][MEDIUM] Add unit tests for email functions (sendWelcomeEmail, sendRejectionEmail, sendInfoRequestEmail)
- [ ] [AI-Review][MEDIUM] Add integration tests for admin procedures (approve, reject, requestMoreInfo)
