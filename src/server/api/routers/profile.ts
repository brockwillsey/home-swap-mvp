/**
 * Profile tRPC Router
 *
 * Handles member profile viewing and editing.
 * Only accessible to authenticated, approved members.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { profileUpdateSchema } from "~/lib/validations/profile";

export const profileRouter = createTRPCRouter({
  /**
   * Get current user's profile
   *
   * Returns profile data for the authenticated user.
   * On first access after approval, syncs Application data to User if needed.
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get user with application data
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      include: {
        application: {
          select: {
            status: true,
            bio: true,
            location: true,
            roles: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Check if user has an approved application
    const isApproved = user.application?.status === "APPROVED";

    // Sync application data to user profile if user fields are empty and application exists
    if (user.application && isApproved) {
      const needsSync =
        !user.bio ||
        !user.location ||
        !user.creativeInterests ||
        !user.image;

      if (needsSync) {
        // Use update and return the result directly (avoids refetch and non-null assertions)
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: {
            bio: user.bio ?? user.application.bio,
            location: user.location ?? user.application.location,
            creativeInterests:
              user.creativeInterests ?? user.application.roles,
            image: user.image ?? user.application.profilePhotoUrl,
          },
        });

        return {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          bio: updatedUser.bio,
          location: updatedUser.location,
          creativeInterests: updatedUser.creativeInterests,
          createdAt: updatedUser.createdAt,
          points: updatedUser.points,
          isApproved,
        };
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      location: user.location,
      creativeInterests: user.creativeInterests,
      createdAt: user.createdAt,
      points: user.points,
      isApproved,
    };
  }),

  /**
   * Update current user's profile
   *
   * Allows updating name, bio, location, creativeInterests, and image.
   * Only approved members can update their profile.
   */
  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user is approved
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: {
          application: {
            select: { status: true },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.application?.status !== "APPROVED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only approved members can update their profile",
        });
      }

      // Build update data - only include fields that are provided
      const updateData: {
        name?: string;
        bio?: string;
        location?: string;
        creativeInterests?: string;
        image?: string | null;
      } = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.creativeInterests !== undefined)
        updateData.creativeInterests = input.creativeInterests;
      if (input.image !== undefined) updateData.image = input.image;

      // Update user
      const updatedUser = await ctx.db.user.update({
        where: { id: userId },
        data: updateData,
      });

      return {
        success: true,
        profile: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          bio: updatedUser.bio,
          location: updatedUser.location,
          creativeInterests: updatedUser.creativeInterests,
          createdAt: updatedUser.createdAt,
          points: updatedUser.points,
        },
      };
    }),

  /**
   * Get another member's public profile by ID
   *
   * Only returns approved members' profiles.
   * Excludes private data like email.
   */
  getMemberById: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify calling user is approved
      const callingUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { application: { select: { status: true } } },
      });

      if (callingUser?.application?.status !== "APPROVED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only approved members can view other profiles",
        });
      }

      // Get member with application data for fallbacks
      const member = await ctx.db.user.findUnique({
        where: { id: input.memberId },
        include: {
          application: {
            select: {
              status: true,
              bio: true,
              location: true,
              roles: true,
              profilePhotoUrl: true,
            },
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      // Only show approved members
      if (member.application?.status !== "APPROVED") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      // Return public profile data with fallbacks to application data
      return {
        id: member.id,
        name: member.name,
        image: member.image ?? member.application?.profilePhotoUrl,
        bio: member.bio ?? member.application?.bio,
        location: member.location ?? member.application?.location,
        creativeInterests: member.creativeInterests ?? member.application?.roles,
        createdAt: member.createdAt,
        // Home listings will be added in Epic 2
        homes: [],
      };
    }),

  /**
   * List all approved members
   *
   * Returns a paginated list of approved members for the directory.
   */
  listMembers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify calling user is approved
      const callingUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { application: { select: { status: true } } },
      });

      if (callingUser?.application?.status !== "APPROVED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only approved members can view the member directory",
        });
      }

      const { limit, cursor } = input;

      // Get approved members
      const members = await ctx.db.user.findMany({
        where: {
          application: {
            status: "APPROVED",
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
          location: true,
          createdAt: true,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (members.length > limit) {
        const nextItem = members.pop();
        nextCursor = nextItem?.id;
      }

      return {
        members,
        nextCursor,
      };
    }),
});
