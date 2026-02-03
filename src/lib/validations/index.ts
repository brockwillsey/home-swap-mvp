/**
 * Zod Validation Schemas for Musa Residency
 *
 * This directory contains all Zod schemas for validation.
 * Per architecture: "Use Zod schemas from `lib/validations/` - no inline schemas"
 *
 * Schema files to be added as features are implemented:
 * - user.ts: User profile validation
 * - listing.ts: Home listing validation
 * - booking.ts: Reservation validation
 * - message.ts: Message validation
 * - application.ts: Membership application validation
 */

import { z } from "zod";

// Common validation patterns
export const emailSchema = z.string().email("Invalid email address");

export const idSchema = z.string().cuid("Invalid ID format");

// Pagination schemas (reusable across routers)
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Date range schema (for availability, bookings)
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
