/**
 * Booking tRPC Router
 *
 * Handles booking requests, approvals, and cancellations.
 * Stories 4-1 through 4-11.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { sendBookingConfirmationEmail, sendBookingDeclinedEmail, sendBookingRequestEmail } from "~/lib/email";

export const bookingRouter = createTRPCRouter({
  /**
   * Create a booking request (Story 4-1, 4-2, 4-3)
   *
   * Supports both points and swap booking types.
   * Auto-confirms for instant book listings.
   */
  create: protectedProcedure
    .input(
      z.object({
        homeId: z.string().min(1),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        bookingType: z.enum(["POINTS", "SWAP"]),
        // For swap bookings
        swapHomeId: z.string().optional(),
        swapStartDate: z.string().datetime().optional(),
        swapEndDate: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { homeId, startDate, endDate, bookingType, swapHomeId, swapStartDate, swapEndDate } = input;

      // Get the listing with owner info
      const listing = await ctx.db.home.findUnique({
        where: { id: homeId },
        include: {
          owner: {
            select: { id: true, email: true, name: true, points: true },
          },
        },
      });

      if (!listing || !listing.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found or not available",
        });
      }

      // Can't book own listing
      if (listing.ownerId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot book your own listing",
        });
      }

      // Validate exchange type preference
      if (bookingType === "POINTS" && listing.exchangeType === "SWAP_ONLY") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This listing only accepts swap bookings",
        });
      }

      if (bookingType === "SWAP" && listing.exchangeType === "POINTS_ONLY") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This listing only accepts points bookings",
        });
      }

      // Parse dates
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      // Calculate nights for points
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const pointsCost = bookingType === "POINTS" ? nights * 100 : null; // 100 points per night

      // Check points balance for points bookings
      if (bookingType === "POINTS") {
        const guest = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { points: true },
        });

        if (!guest || guest.points < (pointsCost ?? 0)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient points. You need ${pointsCost} points but have ${guest?.points ?? 0}.`,
          });
        }
      }

      // Validate swap details
      if (bookingType === "SWAP") {
        if (!swapHomeId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please select a home to offer for the swap",
          });
        }

        // Verify swap home ownership
        const swapHome = await ctx.db.home.findUnique({
          where: { id: swapHomeId },
          select: { ownerId: true, isActive: true },
        });

        if (!swapHome || swapHome.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid swap home selected",
          });
        }

        if (!swapHome.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Your swap home must be published to offer it",
          });
        }
      }

      // Check availability
      const availability = await ctx.db.availability.findFirst({
        where: {
          homeId,
          startDate: { lte: start },
          endDate: { gte: end },
        },
      });

      if (!availability) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The selected dates are not available",
        });
      }

      // Check for conflicting bookings
      const conflictingBooking = await ctx.db.reservation.findFirst({
        where: {
          homeId,
          status: { in: ["PENDING", "CONFIRMED"] },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start },
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "These dates are no longer available",
        });
      }

      // Determine initial status based on booking mode
      const isInstantBook = listing.bookingMode === "INSTANT_BOOK";
      const initialStatus = isInstantBook ? "CONFIRMED" : "PENDING";

      // Create the reservation
      const reservation = await ctx.db.reservation.create({
        data: {
          guestId: ctx.session.user.id,
          homeId,
          startDate: start,
          endDate: end,
          status: initialStatus,
          bookingType,
          pointsCost,
          swapHomeId: bookingType === "SWAP" ? swapHomeId : null,
          swapStartDate: bookingType === "SWAP" && swapStartDate ? new Date(swapStartDate) : null,
          swapEndDate: bookingType === "SWAP" && swapEndDate ? new Date(swapEndDate) : null,
        },
        include: {
          guest: { select: { id: true, email: true, name: true } },
          home: {
            select: {
              id: true,
              title: true,
              location: true,
              owner: { select: { id: true, email: true, name: true } },
            },
          },
        },
      });

      // Handle instant book confirmation
      if (isInstantBook && bookingType === "POINTS" && pointsCost) {
        // Deduct points from guest
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { points: { decrement: pointsCost } },
        });

        // Create point transaction
        await ctx.db.pointTransaction.create({
          data: {
            userId: ctx.session.user.id,
            amount: -pointsCost,
            type: "SPENT_BOOKING",
            description: `Booking at ${listing.title}`,
            reservationId: reservation.id,
          },
        });

        // Send confirmation emails
        await sendBookingConfirmationEmail({
          guestEmail: reservation.guest.email,
          guestName: reservation.guest.name,
          hostEmail: reservation.home.owner.email,
          hostName: reservation.home.owner.name,
          listingTitle: reservation.home.title,
          location: reservation.home.location,
          startDate: start,
          endDate: end,
          bookingType,
          pointsCost,
        });
      } else if (!isInstantBook) {
        // Send booking request email to host
        await sendBookingRequestEmail({
          hostEmail: reservation.home.owner.email,
          hostName: reservation.home.owner.name,
          guestName: reservation.guest.name,
          listingTitle: reservation.home.title,
          startDate: start,
          endDate: end,
          bookingType,
          reservationId: reservation.id,
        });
      }

      return {
        id: reservation.id,
        status: reservation.status,
        isInstantBook,
        success: true,
      };
    }),

  /**
   * Get booking requests for host (pending requests at their listings)
   */
  getHostRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.reservation.findMany({
      where: {
        home: { ownerId: ctx.session.user.id },
        status: "PENDING",
      },
      include: {
        guest: {
          select: { id: true, name: true, image: true, email: true },
        },
        home: {
          select: { id: true, title: true, location: true, photos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get swap home details for swap requests
    const requestsWithSwapHomes = await Promise.all(
      requests.map(async (req) => {
        if (req.swapHomeId) {
          const swapHome = await ctx.db.home.findUnique({
            where: { id: req.swapHomeId },
            select: { id: true, title: true, location: true, photos: true },
          });
          return { ...req, swapHome };
        }
        return { ...req, swapHome: null };
      })
    );

    return requestsWithSwapHomes;
  }),

  /**
   * Get all bookings for current user (as guest and host)
   */
  getMyBookings: protectedProcedure.query(async ({ ctx }) => {
    const [asGuest, asHost] = await Promise.all([
      // Bookings where user is the guest
      ctx.db.reservation.findMany({
        where: { guestId: ctx.session.user.id },
        include: {
          home: {
            select: {
              id: true,
              title: true,
              location: true,
              photos: true,
              owner: { select: { id: true, name: true, image: true } },
            },
          },
        },
        orderBy: { startDate: "desc" },
      }),
      // Bookings where user is the host
      ctx.db.reservation.findMany({
        where: { home: { ownerId: ctx.session.user.id } },
        include: {
          guest: {
            select: { id: true, name: true, image: true },
          },
          home: {
            select: { id: true, title: true, location: true, photos: true },
          },
        },
        orderBy: { startDate: "desc" },
      }),
    ]);

    return { asGuest, asHost };
  }),

  /**
   * Get a single booking by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.db.reservation.findUnique({
        where: { id: input.id },
        include: {
          guest: {
            select: { id: true, name: true, image: true, email: true, bio: true },
          },
          home: {
            select: {
              id: true,
              title: true,
              location: true,
              photos: true,
              description: true,
              owner: { select: { id: true, name: true, image: true, email: true } },
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Verify user is guest or host
      const isGuest = booking.guestId === ctx.session.user.id;
      const isHost = booking.home.owner.id === ctx.session.user.id;

      if (!isGuest && !isHost) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this booking",
        });
      }

      // Get swap home if applicable
      let swapHome = null;
      if (booking.swapHomeId) {
        swapHome = await ctx.db.home.findUnique({
          where: { id: booking.swapHomeId },
          select: { id: true, title: true, location: true, photos: true },
        });
      }

      return { ...booking, swapHome, isGuest, isHost };
    }),

  /**
   * Approve a booking request (Story 4-5)
   */
  approve: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.reservation.findUnique({
        where: { id: input.id },
        include: {
          guest: { select: { id: true, email: true, name: true, points: true } },
          home: {
            select: {
              id: true,
              title: true,
              location: true,
              ownerId: true,
              owner: { select: { email: true, name: true } },
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Verify user is the host
      if (booking.home.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the host can approve this booking",
        });
      }

      if (booking.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This booking is not pending approval",
        });
      }

      // For points bookings, verify guest still has enough points
      if (booking.bookingType === "POINTS" && booking.pointsCost) {
        if (booking.guest.points < booking.pointsCost) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Guest no longer has sufficient points for this booking",
          });
        }

        // Deduct points
        await ctx.db.user.update({
          where: { id: booking.guestId },
          data: { points: { decrement: booking.pointsCost } },
        });

        // Create point transaction
        await ctx.db.pointTransaction.create({
          data: {
            userId: booking.guestId,
            amount: -booking.pointsCost,
            type: "SPENT_BOOKING",
            description: `Booking at ${booking.home.title}`,
            reservationId: booking.id,
          },
        });
      }

      // Update booking status
      await ctx.db.reservation.update({
        where: { id: input.id },
        data: { status: "CONFIRMED" },
      });

      // Send confirmation emails
      await sendBookingConfirmationEmail({
        guestEmail: booking.guest.email,
        guestName: booking.guest.name,
        hostEmail: booking.home.owner.email,
        hostName: booking.home.owner.name,
        listingTitle: booking.home.title,
        location: booking.home.location,
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingType: booking.bookingType,
        pointsCost: booking.pointsCost,
      });

      return { success: true };
    }),

  /**
   * Decline a booking request (Story 4-6)
   */
  decline: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        message: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.reservation.findUnique({
        where: { id: input.id },
        include: {
          guest: { select: { email: true, name: true } },
          home: {
            select: {
              title: true,
              ownerId: true,
              owner: { select: { name: true } },
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Verify user is the host
      if (booking.home.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the host can decline this booking",
        });
      }

      if (booking.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This booking is not pending",
        });
      }

      // Update booking status
      await ctx.db.reservation.update({
        where: { id: input.id },
        data: {
          status: "DECLINED",
          hostMessage: input.message,
        },
      });

      // Send decline email
      await sendBookingDeclinedEmail({
        guestEmail: booking.guest.email,
        guestName: booking.guest.name,
        hostName: booking.home.owner.name,
        listingTitle: booking.home.title,
        startDate: booking.startDate,
        endDate: booking.endDate,
        message: input.message,
      });

      return { success: true };
    }),

  /**
   * Cancel a confirmed booking (Story 4-9)
   */
  cancel: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.reservation.findUnique({
        where: { id: input.id },
        include: {
          guest: { select: { id: true, email: true, name: true } },
          home: {
            select: {
              title: true,
              ownerId: true,
              owner: { select: { email: true, name: true } },
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Verify user is guest or host
      const isGuest = booking.guestId === ctx.session.user.id;
      const isHost = booking.home.ownerId === ctx.session.user.id;

      if (!isGuest && !isHost) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to cancel this booking",
        });
      }

      if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This booking cannot be cancelled",
        });
      }

      // Refund points if applicable
      if (booking.bookingType === "POINTS" && booking.pointsCost && booking.status === "CONFIRMED") {
        await ctx.db.user.update({
          where: { id: booking.guestId },
          data: { points: { increment: booking.pointsCost } },
        });

        // Create refund transaction
        await ctx.db.pointTransaction.create({
          data: {
            userId: booking.guestId,
            amount: booking.pointsCost,
            type: "REFUND",
            description: `Refund for cancelled booking at ${booking.home.title}`,
            reservationId: booking.id,
          },
        });
      }

      // Update booking status
      await ctx.db.reservation.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });

      // TODO: Send cancellation email to the other party

      return { success: true };
    }),

  /**
   * Get pending request count for badge
   */
  getPendingCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.reservation.count({
      where: {
        home: { ownerId: ctx.session.user.id },
        status: "PENDING",
      },
    });

    return count;
  }),
});
