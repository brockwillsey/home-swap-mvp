/**
 * Points tRPC Router
 *
 * Handles points balance and transaction history.
 * Stories 5-1, 5-2, 5-4.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const pointsRouter = createTRPCRouter({
  /**
   * Get current user's points balance (Story 5-1)
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { points: true },
    });

    return { points: user?.points ?? 0 };
  }),

  /**
   * Get points transaction history (Story 5-4)
   */
  getTransactionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const transactions = await ctx.db.pointTransaction.findMany({
        where: { userId: ctx.session.user.id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (transactions.length > limit) {
        const nextItem = transactions.pop();
        nextCursor = nextItem?.id;
      }

      return {
        transactions,
        nextCursor,
      };
    }),

  /**
   * Mark a booking as completed and award points to host (Story 5-2)
   *
   * This is called when checkout date passes. In MVP, host or system can trigger.
   * Points are only awarded for POINTS bookings, not swaps.
   */
  markStayCompleted: protectedProcedure
    .input(z.object({ reservationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.db.reservation.findUnique({
        where: { id: input.reservationId },
        include: {
          home: {
            select: { ownerId: true, title: true },
          },
          guest: {
            select: { name: true },
          },
        },
      });

      if (!reservation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reservation not found",
        });
      }

      // Verify user is the host
      if (reservation.home.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the host can mark a stay as completed",
        });
      }

      if (reservation.status !== "CONFIRMED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only confirmed reservations can be marked as completed",
        });
      }

      // Check if end date has passed
      const now = new Date();
      if (reservation.endDate > now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot mark as completed before checkout date",
        });
      }

      // Update reservation status
      await ctx.db.reservation.update({
        where: { id: input.reservationId },
        data: { status: "COMPLETED" },
      });

      // Award points for POINTS bookings only (swaps are reciprocal, no points)
      if (reservation.bookingType === "POINTS") {
        // Calculate nights
        const nights = Math.ceil(
          (reservation.endDate.getTime() - reservation.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Award points to host (100 points per night, same as cost)
        const pointsEarned = nights * 100;

        await ctx.db.user.update({
          where: { id: reservation.home.ownerId },
          data: { points: { increment: pointsEarned } },
        });

        // Create transaction record
        await ctx.db.pointTransaction.create({
          data: {
            userId: reservation.home.ownerId,
            amount: pointsEarned,
            type: "EARNED_HOSTING",
            description: `Hosted ${reservation.guest.name ?? "Guest"} for ${nights} night${nights !== 1 ? "s" : ""}`,
            reservationId: reservation.id,
          },
        });

        return { success: true, pointsEarned };
      }

      return { success: true, pointsEarned: 0 };
    }),

  /**
   * Get stats summary for points page
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { points: true },
    });

    // Get aggregate stats
    const [earned, spent] = await Promise.all([
      ctx.db.pointTransaction.aggregate({
        where: {
          userId: ctx.session.user.id,
          type: "EARNED_HOSTING",
        },
        _sum: { amount: true },
      }),
      ctx.db.pointTransaction.aggregate({
        where: {
          userId: ctx.session.user.id,
          type: "SPENT_BOOKING",
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      currentBalance: user?.points ?? 0,
      totalEarned: earned._sum.amount ?? 0,
      totalSpent: Math.abs(spent._sum.amount ?? 0),
    };
  }),
});
