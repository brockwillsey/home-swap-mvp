/**
 * Search tRPC Router
 *
 * Handles home search and discovery functionality.
 * All procedures require authentication.
 */

import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const searchRouter = createTRPCRouter({
  /**
   * Search homes by location and optional date range
   *
   * Returns published homes matching the search criteria.
   * If dates provided, only returns homes with availability in that range.
   */
  homes: protectedProcedure
    .input(
      z.object({
        location: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { location, startDate, endDate, limit, cursor } = input;

      // Build where clause
      const where: {
        isActive: boolean;
        ownerId?: { not: string };
        location?: { contains: string; mode: "insensitive" };
        availability?: {
          some: {
            startDate: { lte: Date };
            endDate: { gte: Date };
          };
        };
      } = {
        isActive: true,
        // Don't show user's own listings in search
        ownerId: { not: ctx.session.user.id },
      };

      // Location filter (case-insensitive contains)
      if (location && location.trim()) {
        where.location = {
          contains: location.trim(),
          mode: "insensitive",
        };
      }

      // Date range filter - only show homes available during requested dates
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        where.availability = {
          some: {
            startDate: { lte: start },
            endDate: { gte: end },
          },
        };
      }

      const homes = await ctx.db.home.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          availability: {
            where: {
              endDate: { gte: new Date() },
            },
            orderBy: { startDate: "asc" },
            take: 3,
          },
        },
      });

      let nextCursor: string | undefined;
      if (homes.length > limit) {
        const nextItem = homes.pop();
        nextCursor = nextItem?.id;
      }

      return {
        homes,
        nextCursor,
      };
    }),

  /**
   * Get location suggestions for autocomplete
   *
   * Returns distinct locations from published homes.
   */
  locationSuggestions: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query } = input;

      // Get distinct locations matching the query
      const homes = await ctx.db.home.findMany({
        where: {
          isActive: true,
          location: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          location: true,
        },
        distinct: ["location"],
        take: 10,
      });

      return homes.map((h) => h.location);
    }),

  /**
   * Get a single listing for public view
   *
   * Returns full listing details including owner info.
   */
  getListing: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.home.findUnique({
        where: { id: input.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
              location: true,
              creativeInterests: true,
              createdAt: true,
            },
          },
          availability: {
            where: {
              endDate: { gte: new Date() },
            },
            orderBy: { startDate: "asc" },
          },
        },
      });

      if (!listing) {
        return null;
      }

      // Only show active listings to non-owners
      if (!listing.isActive && listing.ownerId !== ctx.session.user.id) {
        return null;
      }

      return listing;
    }),
});
