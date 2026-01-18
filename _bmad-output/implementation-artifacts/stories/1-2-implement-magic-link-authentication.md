# Story 1.2: Implement Magic Link Authentication

Status: done

## Story

As a **visitor**,
I want **to sign in using a magic link sent to my email**,
so that **I can securely access my account without remembering a password**.

## Acceptance Criteria

1. **Given** I am on the sign-in page
   **When** I enter my email address and submit
   **Then** a magic link is sent to my email via Resend
   **And** I see a confirmation message: "Check your email for a sign-in link"

2. **Given** I have received a magic link email
   **When** I click the link within 10 minutes
   **Then** I am authenticated and redirected to my dashboard
   **And** a secure session is created

3. **Given** I click an expired magic link
   **When** more than 10 minutes have passed
   **Then** I see an error message and can request a new link

## Tasks / Subtasks

- [x] Task 1: Install and Configure Resend (AC: #1)
  - [x] Install Resend package: `pnpm add resend`
  - [x] Create Resend service client at `src/lib/services/resend.ts`
  - [x] Verify RESEND_API_KEY is configured in `.env`
  - [x] Test Resend connection with a simple send

- [x] Task 2: Configure NextAuth Email Provider (AC: #1, #2)
  - [x] Add Email provider to `src/server/auth/config.ts`
  - [x] Configure Resend as the email transport
  - [x] Set magic link expiration to 10 minutes (600 seconds)
  - [x] Configure custom email template with Art Res branding

- [x] Task 3: Create Sign-In Page (AC: #1)
  - [x] Create `src/app/(public)/auth/signin/page.tsx`
  - [x] Build email input form with React Hook Form + Zod validation
  - [x] Use shadcn/ui components (Input, Button, Card)
  - [x] Show loading state during submission
  - [x] Handle errors with toast notifications

- [x] Task 4: Create Verify Request Page (AC: #1)
  - [x] Create `src/app/(public)/auth/verify/page.tsx`
  - [x] Display "Check your email" confirmation message
  - [x] Include email icon and Art Res branding
  - [x] Provide "Resend link" option after 60 seconds

- [x] Task 5: Create Auth Error Page (AC: #3)
  - [x] Create `src/app/(public)/auth/error/page.tsx`
  - [x] Handle expired link error with friendly message
  - [x] Handle invalid token error
  - [x] Provide "Request new link" button linking to signin

- [x] Task 6: Add Auth Validation Schema (AC: #1, #2, #3)
  - [x] Create `src/lib/validations/auth.ts`
  - [x] Define emailSchema for signin form validation
  - [x] Export for use in signin page

- [x] Task 7: Update Dashboard Redirect (AC: #2)
  - [x] Ensure successful auth redirects to `/dashboard`
  - [x] Create placeholder dashboard page at `src/app/(member)/dashboard/page.tsx`
  - [x] Verify session contains user.id and user.role

- [x] Task 8: Verify Build and Test (AC: #1, #2, #3)
  - [x] Run `pnpm typecheck` - no TypeScript errors
  - [x] Run `pnpm build` - production build succeeds
  - [x] Manual test: Submit email, receive link, click link, verify session

## Dev Notes

### Technology Stack (From Architecture)

| Component | Choice | Version/Details |
|-----------|--------|-----------------|
| Auth Provider | NextAuth.js | 5.0.0-beta.25 |
| Email Transport | Resend | Latest |
| Email Provider | NextAuth Email | Built-in |
| Session Strategy | JWT | Stateless, serverless compatible |
| Validation | Zod | 3.25.76 |
| Forms | React Hook Form | With Zod resolver |

### Architecture Requirements

**Authentication Strategy (From Architecture):**
- Auth Method: Magic Link (passwordless)
- Auth Provider: NextAuth.js + Resend
- Session: JWT via NextAuth
- Authorization: Role-based (MEMBER/ADMIN) via user.role

**Custom Pages (Already configured in Story 1.1):**
```typescript
pages: {
  signIn: "/auth/signin",
  verifyRequest: "/auth/verify",
  error: "/auth/error",
}
```

### Previous Story Intelligence (1.1)

**Files Created/Modified:**
- `src/server/auth/config.ts` - PrismaAdapter configured, session callback includes role
- `prisma/schema.prisma` - VerificationToken model exists for magic link
- `src/env.js` - RESEND_API_KEY already defined as optional
- `.env.example` - RESEND_API_KEY documented

**Patterns Established:**
- shadcn/ui components in `src/components/ui/`
- Validation schemas in `src/lib/validations/`
- Constants in `src/lib/constants.ts`
- Services should go in `src/lib/services/`

**Session Callback (Already Implemented):**
```typescript
session: ({ session, user }) => ({
  ...session,
  user: {
    ...session.user,
    id: user.id,
    role: (user as { role?: "MEMBER" | "ADMIN" }).role,
  },
}),
```

### Implementation Details

**1. Resend Service (`src/lib/services/resend.ts`):**
```typescript
import { Resend } from "resend";
import { env } from "~/env";

export const resend = new Resend(env.RESEND_API_KEY);
```

**2. NextAuth Email Provider Configuration:**
```typescript
import EmailProvider from "next-auth/providers/email";
import { resend } from "~/lib/services/resend";

EmailProvider({
  server: {
    host: "smtp.resend.com",
    port: 465,
    auth: {
      user: "resend",
      pass: env.RESEND_API_KEY,
    },
  },
  from: "Art Res <noreply@artres.com>", // Update with actual domain
  maxAge: 10 * 60, // 10 minutes
  // OR use sendVerificationRequest for custom emails
})
```

**3. Custom Email Template (Recommended):**
Use `sendVerificationRequest` callback for branded emails via Resend API directly.

**4. Sign-In Page Structure:**
```
src/app/(public)/auth/signin/page.tsx
- Email input (shadcn Input)
- Submit button (shadcn Button)
- Art Res branding/logo
- Error handling via toast
```

**5. Route Groups:**
- `(public)` - No auth required (signin, verify, error, apply)
- `(member)` - Auth required (dashboard, listings, etc.)

### File Structure for This Story

**New Files to Create:**
```
src/
├── lib/
│   ├── services/
│   │   └── resend.ts              # Resend client
│   └── validations/
│       └── auth.ts                # Auth validation schemas
├── app/
│   ├── (public)/
│   │   └── auth/
│   │       ├── signin/
│   │       │   └── page.tsx       # Sign-in form
│   │       ├── verify/
│   │       │   └── page.tsx       # "Check your email" page
│   │       └── error/
│   │           └── page.tsx       # Error handling page
│   └── (member)/
│       └── dashboard/
│           └── page.tsx           # Dashboard (placeholder)
```

**Files to Modify:**
```
src/server/auth/config.ts          # Add Email provider
src/env.js                         # Make RESEND_API_KEY required
```

### Project Structure Notes (From Architecture)

**Route Groups:**
- `(public)/` - No auth required
- `(member)/` - Auth required (middleware protects)
- `(admin)/` - Admin only

**Component Naming:**
- PascalCase for React components
- Files: `SignInForm.tsx`, `VerifyPage.tsx`

### Naming Conventions (MUST Follow)

| Element | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase.tsx | `SignInForm.tsx` |
| Validation schemas | camelCase | `emailSchema`, `signInSchema` |
| Service clients | camelCase | `resend` |
| Pages | page.tsx (Next.js convention) | `app/auth/signin/page.tsx` |

### Critical Architecture Rules

1. **ALWAYS use shadcn/ui components** - Button, Input, Card, Form from `components/ui/`
2. **ALWAYS use Zod schemas** from `lib/validations/` - no inline validation
3. **ALWAYS use React Hook Form** with Zod resolver for forms
4. **FOLLOW naming conventions exactly** - PascalCase components, camelCase vars
5. **Use services directory** for external API clients (`lib/services/`)

### Testing Approach

**Manual Testing (MVP):**
1. Navigate to `/auth/signin`
2. Enter email address
3. Submit form
4. Check email inbox for magic link
5. Click link within 10 minutes → should redirect to dashboard
6. Try clicking expired link → should show error

**Edge Cases:**
- Invalid email format → validation error
- Non-existent email → still sends link (security: don't reveal if email exists)
- Expired link → error page with retry option
- Already authenticated → redirect to dashboard

### References

- [Source: architecture.md#Authentication & Security]
- [Source: architecture.md#Implementation Patterns & Consistency Rules]
- [Source: architecture.md#Project Structure & Boundaries]
- [Source: epics.md#Story 1.2: Implement Magic Link Authentication]
- [Source: story-1-1-initialize-project-foundation.md#Dev Agent Record]
- [NextAuth Email Provider](https://authjs.dev/getting-started/providers/email)
- [Resend Documentation](https://resend.com/docs)

### Environment Variables Required

```bash
# Required for this story
RESEND_API_KEY="re_xxxxxxxxxxxx"  # Get from https://resend.com/api-keys
AUTH_SECRET="..."                  # Already configured in Story 1.1
DATABASE_URL="..."                 # Already configured in Story 1.1
```

### Resend Setup Notes

1. Create account at https://resend.com
2. Verify a domain (or use resend.dev for testing)
3. Create API key with "Sending access" permission
4. Add to `.env`: `RESEND_API_KEY=re_xxxxxxxxxxxx`

**Free Tier Limits:**
- 3,000 emails/month
- 100 emails/day
- Sufficient for MVP (50 members)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Installed Resend v6.7.0 for email delivery
- Created comprehensive Resend service with Art Res branded email templates (HTML + text)
- Configured NextAuth Resend provider with 10-minute magic link expiration
- Built sign-in page with React Hook Form + Zod validation, loading states, error handling
- Created verify page with "Check your email" message, countdown timer, and resend functionality
- Created error page handling Verification, AccessDenied, Configuration, and OAuthAccountNotLinked errors
- Added auth validation schema with emailSchema and signInSchema
- Created placeholder dashboard page showing user session info (id, email, role)
- Updated home page to link to /auth/signin instead of /api/auth/signin
- Used Suspense boundaries for all pages using useSearchParams (Next.js 15 requirement)
- All TypeScript checks pass, production build succeeds

### Code Review Notes

**Review Date:** 2026-01-17
**Reviewer:** Claude Opus 4.5 (Adversarial Code Review)

**Issues Found and Fixed (7 total):**
1. **Silent email failure** - Changed to throw error when Resend not configured (auth/config.ts:47-49)
2. **No error feedback on resend** - Added error/success states to verify page (VerifyPageContent.tsx)
3. **Sign out uses GET link** - Created SignOutButton component using signOut() with POST
4. **Email exposed in URL** - Changed to use sessionStorage instead of URL params
5. **Email not normalized** - Added .trim().toLowerCase() transform to emailSchema
6. **Silent role fallback** - Added clarifying comment that MEMBER default is intentional
7. **Non-null assertion** - Extracted DEFAULT_ERROR constant to avoid `!` operator

**Verdict:** PASS after fixes

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-17 | Story created with comprehensive context | SM Agent (Claude Opus 4.5) |
| 2026-01-17 | Implemented magic link authentication with Resend | Dev Agent (Claude Opus 4.5) |
| 2026-01-17 | Code review: Fixed 7 issues (security, UX, code quality) | Code Review Agent (Claude Opus 4.5) |

### File List

**Created:**
- src/lib/services/resend.ts
- src/lib/validations/auth.ts
- src/app/(public)/auth/signin/page.tsx
- src/app/(public)/auth/signin/SignInPageContent.tsx
- src/app/(public)/auth/verify/page.tsx
- src/app/(public)/auth/verify/VerifyPageContent.tsx
- src/app/(public)/auth/error/page.tsx
- src/app/(public)/auth/error/ErrorPageContent.tsx
- src/app/(member)/dashboard/page.tsx
- src/components/auth/SignOutButton.tsx (added in code review)

**Modified:**
- src/server/auth/config.ts (added Resend provider with custom email template)
- src/app/page.tsx (updated sign-in link to /auth/signin, added dashboard link, SignOutButton)
- package.json (added resend dependency)
