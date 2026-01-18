/**
 * Profile tRPC Router
 *
 * Handles member profile viewing and editing.
 * Only accessible to authenticated, approved members.
 */

import { TRPCError } from "@trpc/server";

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
            creativeInterests: true,
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
              user.creativeInterests ?? user.application.creativeInterests,
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
});
