/**
 * Admin tRPC Router
 *
 * Handles admin-only operations for member management and platform stats.
 * Stories 7-7 and 7-8.
 */

import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  /**
   * Get all approved members (Story 7-7)
   */
  getMembers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, limit, cursor } = input;

      const where = {
        application: {
          status: "APPROVED" as const,
        },
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const members = await ctx.db.user.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          application: {
            select: { reviewedAt: true },
          },
          _count: {
            select: { homes: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (members.length > limit) {
        const nextItem = members.pop();
        nextCursor = nextItem?.id;
      }

      return {
        members: members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          image: m.image,
          location: m.location,
          memberSince: m.application?.reviewedAt ?? m.createdAt,
          listingCount: m._count.homes,
        })),
        nextCursor,
      };
    }),

  /**
   * Get platform activity stats (Story 7-8)
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalMembers,
      totalListings,
      totalBookings,
      completedBookings,
      newMembersWeek,
      newMembersMonth,
      newListingsWeek,
      newListingsMonth,
      bookingsThisMonth,
      pendingApplications,
    ] = await Promise.all([
      // Total approved members
      ctx.db.application.count({ where: { status: "APPROVED" } }),
      // Total active listings
      ctx.db.home.count({ where: { isActive: true } }),
      // Total bookings
      ctx.db.reservation.count(),
      // Completed stays
      ctx.db.reservation.count({ where: { status: "COMPLETED" } }),
      // New members this week
      ctx.db.application.count({
        where: {
          status: "APPROVED",
          reviewedAt: { gte: oneWeekAgo },
        },
      }),
      // New members this month
      ctx.db.application.count({
        where: {
          status: "APPROVED",
          reviewedAt: { gte: oneMonthAgo },
        },
      }),
      // New listings this week
      ctx.db.home.count({
        where: {
          createdAt: { gte: oneWeekAgo },
        },
      }),
      // New listings this month
      ctx.db.home.count({
        where: {
          createdAt: { gte: oneMonthAgo },
        },
      }),
      // Bookings this month
      ctx.db.reservation.count({
        where: {
          createdAt: { gte: oneMonthAgo },
        },
      }),
      // Pending applications
      ctx.db.application.count({ where: { status: "SUBMITTED" } }),
    ]);

    return {
      totalMembers,
      totalListings,
      totalBookings,
      completedBookings,
      newMembersWeek,
      newMembersMonth,
      newListingsWeek,
      newListingsMonth,
      bookingsThisMonth,
      pendingApplications,
    };
  }),

  /**
   * Get recent activity (Story 7-8)
   */
  getRecentActivity: adminProcedure.query(async ({ ctx }) => {
    const [recentMembers, recentListings, recentBookings] = await Promise.all([
      // Recent approved members
      ctx.db.application.findMany({
        where: { status: "APPROVED" },
        orderBy: { reviewedAt: "desc" },
        take: 5,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      // Recent listings
      ctx.db.home.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          owner: {
            select: { id: true, name: true },
          },
        },
      }),
      // Recent bookings
      ctx.db.reservation.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          guest: {
            select: { id: true, name: true },
          },
          home: {
            select: { id: true, title: true },
          },
        },
      }),
    ]);

    return {
      recentMembers: recentMembers.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        image: a.user.image,
        approvedAt: a.reviewedAt,
      })),
      recentListings: recentListings.map((l) => ({
        id: l.id,
        title: l.title,
        location: l.location,
        ownerName: l.owner.name,
        createdAt: l.createdAt,
      })),
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        guestName: b.guest.name,
        listingTitle: b.home.title,
        status: b.status,
        createdAt: b.createdAt,
      })),
    };
  }),
});
