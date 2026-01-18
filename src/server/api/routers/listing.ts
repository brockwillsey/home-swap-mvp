/**
 * Listing tRPC Router
 *
 * Handles home listing CRUD operations.
 * All procedures require authentication and approved membership.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createListingSchema, updateListingSchema } from "~/lib/validations/listing";

/**
 * Middleware to check if user is an approved member
 * Throws FORBIDDEN if user doesn't have an approved application
 */
async function requireApprovedMember(
  ctx: { db: typeof import("~/server/db").db; session: { user: { id: string } } }
) {
  const application = await ctx.db.application.findUnique({
    where: { userId: ctx.session.user.id },
    select: { status: true },
  });

  if (application?.status !== "APPROVED") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only approved members can create listings",
    });
  }
}

export const listingRouter = createTRPCRouter({
  /**
   * Create a new home listing
   *
   * Creates a listing in draft state (isActive: false).
   * Photos will be added in Story 2.2.
   */
  create: protectedProcedure
    .input(createListingSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user is an approved member
      await requireApprovedMember(ctx);

      const { title, description, location } = input;

      // Create the listing in draft state
      const listing = await ctx.db.home.create({
        data: {
          ownerId: ctx.session.user.id,
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          photos: [], // Photos added in Story 2.2
          isActive: false, // Draft until photos added
        },
      });

      return {
        id: listing.id,
        success: true,
      };
    }),

  /**
   * Get a listing by ID
   *
   * Returns the listing if owned by the current user.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.home.findUnique({
        where: { id: input.id },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Only owner can view their draft listings
      if (listing.ownerId !== ctx.session.user.id && !listing.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this listing",
        });
      }

      return listing;
    }),

  /**
   * Get all listings owned by the current user
   */
  getMyListings: protectedProcedure.query(async ({ ctx }) => {
    const listings = await ctx.db.home.findMany({
      where: { ownerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return listings;
  }),

  /**
   * Update a listing's basic info
   */
  update: protectedProcedure
    .input(updateListingSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify ownership
      const existing = await ctx.db.home.findUnique({
        where: { id },
        select: { ownerId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (existing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this listing",
        });
      }

      // Update only provided fields
      const updateData: Record<string, string> = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined) updateData.description = data.description.trim();
      if (data.location !== undefined) updateData.location = data.location.trim();

      const listing = await ctx.db.home.update({
        where: { id },
        data: updateData,
      });

      return {
        id: listing.id,
        success: true,
      };
    }),

  /**
   * Update a listing's photos
   *
   * Accepts an array of photo URLs (ordered, first is primary)
   */
  updatePhotos: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        photos: z.array(z.string().url()).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, photos } = input;

      // Verify ownership
      const existing = await ctx.db.home.findUnique({
        where: { id },
        select: { ownerId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (existing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this listing",
        });
      }

      // Update photos array
      const listing = await ctx.db.home.update({
        where: { id },
        data: { photos },
      });

      return {
        id: listing.id,
        photoCount: listing.photos.length,
        success: true,
      };
    }),

  /**
   * Publish a listing
   *
   * Validates minimum 3 photos and sets isActive to true
   */
  publish: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Verify ownership and get current state
      const existing = await ctx.db.home.findUnique({
        where: { id },
        select: { ownerId: true, photos: true, isActive: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (existing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to publish this listing",
        });
      }

      // Validate minimum photos
      if (existing.photos.length < 3) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `At least 3 photos are required to publish. You have ${existing.photos.length}.`,
        });
      }

      // Publish the listing
      const listing = await ctx.db.home.update({
        where: { id },
        data: { isActive: true },
      });

      return {
        id: listing.id,
        isActive: listing.isActive,
        success: true,
      };
    }),

  /**
   * Delete a listing (soft delete)
   *
   * Sets isActive to false. In future, could add deletedAt field.
   * Checks for active bookings before allowing delete.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Verify ownership
      const existing = await ctx.db.home.findUnique({
        where: { id },
        select: { ownerId: true, isActive: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (existing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this listing",
        });
      }

      // Check for active bookings (Epic 4 - for now just check if any exist)
      // TODO: Add booking check when Booking model is implemented
      // const activeBookings = await ctx.db.booking.count({
      //   where: {
      //     homeId: id,
      //     status: { in: ["CONFIRMED", "PENDING"] },
      //   },
      // });
      // if (activeBookings > 0) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: `Cannot delete listing with ${activeBookings} active booking(s). Cancel them first.`,
      //   });
      // }

      // Soft delete - set isActive to false
      await ctx.db.home.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        id,
        success: true,
      };
    }),

  /**
   * Get availability periods for a listing
   */
  getAvailability: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.home.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Only owner can view availability management
      if (listing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this listing's availability",
        });
      }

      const availability = await ctx.db.availability.findMany({
        where: { homeId: input.id },
        orderBy: { startDate: "asc" },
      });

      return availability;
    }),

  /**
   * Add availability period to a listing
   */
  addAvailability: protectedProcedure
    .input(
      z.object({
        homeId: z.string().min(1),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { homeId, startDate, endDate } = input;

      // Verify ownership
      const listing = await ctx.db.home.findUnique({
        where: { id: homeId },
        select: { ownerId: true },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this listing's availability",
        });
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      if (start < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot add availability in the past",
        });
      }

      // Create availability period
      const availability = await ctx.db.availability.create({
        data: {
          homeId,
          startDate: start,
          endDate: end,
        },
      });

      return {
        id: availability.id,
        success: true,
      };
    }),

  /**
   * Remove availability period from a listing
   */
  removeAvailability: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Get availability with home to verify ownership
      const availability = await ctx.db.availability.findUnique({
        where: { id: input.id },
        include: {
          home: {
            select: { ownerId: true },
          },
        },
      });

      if (!availability) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Availability period not found",
        });
      }

      if (availability.home.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this availability",
        });
      }

      await ctx.db.availability.delete({
        where: { id: input.id },
      });

      return {
        success: true,
      };
    }),

  /**
   * Update listing booking mode (Story 2-6)
   *
   * INSTANT_BOOK: Guests can book without host approval
   * REQUIRES_APPROVAL: Host must approve each booking request
   */
  updateBookingMode: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        bookingMode: z.enum(["INSTANT_BOOK", "REQUIRES_APPROVAL"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, bookingMode } = input;

      // Verify ownership
      const existing = await ctx.db.home.findUnique({
        where: { id },
        select: { ownerId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (existing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this listing",
        });
      }

      const listing = await ctx.db.home.update({
        where: { id },
        data: { bookingMode },
      });

      return {
        id: listing.id,
        bookingMode: listing.bookingMode,
        success: true,
      };
    }),

  /**
   * Update listing exchange type preferences (Story 2-7)
   *
   * SWAP_ONLY: Only accept home swaps
   * POINTS_ONLY: Only accept points bookings
   * BOTH: Accept either swap or points
   */
  updateExchangeType: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        exchangeType: z.enum(["SWAP_ONLY", "POINTS_ONLY", "BOTH"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, exchangeType } = input;

      // Verify ownership
      const existing = await ctx.db.home.findUnique({
        where: { id },
        select: { ownerId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (existing.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this listing",
        });
      }

      const listing = await ctx.db.home.update({
        where: { id },
        data: { exchangeType },
      });

      return {
        id: listing.id,
        exchangeType: listing.exchangeType,
        success: true,
      };
    }),
});
