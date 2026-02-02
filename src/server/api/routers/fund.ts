/**
 * Fund tRPC Router
 *
 * Handles crowdfunding fund CRUD operations.
 * Allows approved members to create and manage fundraising campaigns.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { createFundSchema, updateFundSchema } from "~/lib/validations/fund";

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
      message: "Only approved members can create funds",
    });
  }
}

export const fundRouter = createTRPCRouter({
  /**
   * Create a new fund
   * Only approved members can create funds
   */
  create: protectedProcedure
    .input(createFundSchema)
    .mutation(async ({ ctx, input }) => {
      await requireApprovedMember(ctx);

      const { title, description, goalAmount, homeId, coverImage } = input;

      // If homeId is provided, verify ownership
      if (homeId) {
        const home = await ctx.db.home.findUnique({
          where: { id: homeId },
          select: { ownerId: true },
        });

        if (!home) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Listing not found",
          });
        }

        if (home.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only link funds to your own listings",
          });
        }
      }

      const fund = await ctx.db.fund.create({
        data: {
          creatorId: ctx.session.user.id,
          title: title.trim(),
          description: description.trim(),
          goalAmount,
          homeId,
          coverImage,
          status: "DRAFT",
        },
      });

      return {
        id: fund.id,
        success: true,
      };
    }),

  /**
   * Update a fund
   * Only the creator can update their fund
   */
  update: protectedProcedure
    .input(updateFundSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.fund.findUnique({
        where: { id },
        select: { creatorId: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      if (existing.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this fund",
        });
      }

      // If homeId is being updated, verify ownership
      if (data.homeId) {
        const home = await ctx.db.home.findUnique({
          where: { id: data.homeId },
          select: { ownerId: true },
        });

        if (!home) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Listing not found",
          });
        }

        if (home.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only link funds to your own listings",
          });
        }
      }

      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined) updateData.description = data.description.trim();
      if (data.goalAmount !== undefined) updateData.goalAmount = data.goalAmount;
      if (data.homeId !== undefined) updateData.homeId = data.homeId;
      if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;

      const fund = await ctx.db.fund.update({
        where: { id },
        data: updateData,
      });

      return {
        id: fund.id,
        success: true,
      };
    }),

  /**
   * Publish a fund (DRAFT -> ACTIVE)
   */
  publish: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.fund.findUnique({
        where: { id: input.id },
        select: { creatorId: true, status: true, title: true, description: true, goalAmount: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      if (existing.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to publish this fund",
        });
      }

      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft funds can be published",
        });
      }

      // Validate required fields
      if (!existing.title || !existing.description || !existing.goalAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Title, description, and goal amount are required to publish",
        });
      }

      const fund = await ctx.db.fund.update({
        where: { id: input.id },
        data: {
          status: "ACTIVE",
          publishedAt: new Date(),
        },
      });

      return {
        id: fund.id,
        status: fund.status,
        success: true,
      };
    }),

  /**
   * Pause a fund (ACTIVE -> PAUSED)
   */
  pause: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.fund.findUnique({
        where: { id: input.id },
        select: { creatorId: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      if (existing.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to pause this fund",
        });
      }

      if (existing.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only active funds can be paused",
        });
      }

      const fund = await ctx.db.fund.update({
        where: { id: input.id },
        data: { status: "PAUSED" },
      });

      return {
        id: fund.id,
        status: fund.status,
        success: true,
      };
    }),

  /**
   * Resume a fund (PAUSED -> ACTIVE)
   */
  resume: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.fund.findUnique({
        where: { id: input.id },
        select: { creatorId: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      if (existing.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to resume this fund",
        });
      }

      if (existing.status !== "PAUSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only paused funds can be resumed",
        });
      }

      const fund = await ctx.db.fund.update({
        where: { id: input.id },
        data: { status: "ACTIVE" },
      });

      return {
        id: fund.id,
        status: fund.status,
        success: true,
      };
    }),

  /**
   * Delete a fund (only DRAFT funds)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.fund.findUnique({
        where: { id: input.id },
        select: { creatorId: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      if (existing.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this fund",
        });
      }

      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft funds can be deleted. Please pause or cancel active funds.",
        });
      }

      await ctx.db.fund.delete({
        where: { id: input.id },
      });

      return {
        success: true,
      };
    }),

  /**
   * Get a fund by ID
   * Public can view ACTIVE funds, creator can view all their funds
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const fund = await ctx.db.fund.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          home: {
            select: {
              id: true,
              title: true,
              location: true,
              photos: true,
            },
          },
          donations: {
            where: { status: "COMPLETED" },
            orderBy: { completedAt: "desc" },
            take: 10,
            select: {
              id: true,
              amount: true,
              message: true,
              isAnonymous: true,
              completedAt: true,
              donor: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!fund) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      // Only creator can view non-active funds
      const isCreator = ctx.session?.user?.id === fund.creatorId;
      if (fund.status !== "ACTIVE" && !isCreator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      // Count total donations
      const donationCount = await ctx.db.donation.count({
        where: { fundId: input.id, status: "COMPLETED" },
      });

      return {
        ...fund,
        donationCount,
      };
    }),

  /**
   * Get the current user's created funds
   */
  getMyFunds: protectedProcedure.query(async ({ ctx }) => {
    const funds = await ctx.db.fund.findMany({
      where: { creatorId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            donations: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
    });

    return funds;
  }),

  /**
   * Get all active funds (browse page)
   */
  getActiveFunds: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(12),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const funds = await ctx.db.fund.findMany({
        where: { status: "ACTIVE" },
        orderBy: { publishedAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              donations: {
                where: { status: "COMPLETED" },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (funds.length > limit) {
        const nextItem = funds.pop();
        nextCursor = nextItem?.id;
      }

      return {
        funds,
        nextCursor,
      };
    }),

  /**
   * Get donations for a fund (creator only)
   */
  getDonations: protectedProcedure
    .input(
      z.object({
        fundId: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { fundId, limit, cursor } = input;

      // Verify ownership
      const fund = await ctx.db.fund.findUnique({
        where: { id: fundId },
        select: { creatorId: true },
      });

      if (!fund) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fund not found",
        });
      }

      if (fund.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view donations to your own funds",
        });
      }

      const donations = await ctx.db.donation.findMany({
        where: { fundId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (donations.length > limit) {
        const nextItem = donations.pop();
        nextCursor = nextItem?.id;
      }

      return {
        donations,
        nextCursor,
      };
    }),
});
