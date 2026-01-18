/**
 * Application tRPC Router
 *
 * Handles membership application submissions and admin review.
 * Rate-limited public endpoint - no authentication required for applying.
 * Admin procedures for approval/rejection require ADMIN role.
 */

import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, rateLimitedProcedure, adminProcedure } from "~/server/api/trpc";
import { applicationFormSchema } from "~/lib/validations/application";
import { createRefund } from "~/lib/services/stripe";

export const applicationRouter = createTRPCRouter({
  /**
   * Create a new membership application
   *
   * Flow:
   * 1. Check if user already exists with this email
   * 2. If user exists and has application, return error or allow reapplication
   * 3. Create user (or use existing) and create application
   * 4. Return success status (no IDs exposed)
   *
   * Security:
   * - Rate limited: 5 requests per minute per IP
   * - Handles race conditions with unique constraint catch
   */
  create: rateLimitedProcedure
    .input(applicationFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, name, bio, location, creativeInterests, reasonForJoining, profilePhotoUrl, homePhotos } = input;

      try {
        // Check if user already exists
        const existingUser = await ctx.db.user.findUnique({
          where: { email },
          include: { application: true },
        });

        // If user exists and has an application, check status
        if (existingUser?.application) {
          const status = existingUser.application.status;

          if (status === "APPROVED") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "You are already an approved member. Please sign in.",
            });
          }

          if (status === "PENDING" || status === "SUBMITTED") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "You already have a pending application. Please wait for review.",
            });
          }

          // If rejected or needs info, allow reapplication by updating existing
          if (status === "REJECTED" || status === "NEEDS_INFO") {
            await ctx.db.application.update({
              where: { userId: existingUser.id },
              data: {
                status: "PENDING",
                bio,
                location,
                creativeInterests,
                reasonForJoining,
                profilePhotoUrl,
                homePhotos,
                feedback: null, // Clear previous feedback
                stripePaymentId: null, // Clear previous payment ID for new application
                reviewedAt: null, // Clear previous review timestamp
                reviewedBy: null, // Clear previous reviewer
              },
            });

            // Update user name if changed
            if (existingUser.name !== name) {
              await ctx.db.user.update({
                where: { id: existingUser.id },
                data: { name },
              });
            }

            return {
              success: true,
              isReapplication: true,
            };
          }
        }

        // Create new user and application in a transaction
        await ctx.db.$transaction(async (tx) => {
          // Create or update user
          const user = existingUser
            ? await tx.user.update({
                where: { id: existingUser.id },
                data: { name },
              })
            : await tx.user.create({
                data: {
                  email,
                  name,
                },
              });

          // Create application
          await tx.application.create({
            data: {
              userId: user.id,
              status: "PENDING",
              bio,
              location,
              creativeInterests,
              reasonForJoining,
              profilePhotoUrl,
              homePhotos,
            },
          });
        });

        return {
          success: true,
          isReapplication: false,
        };
      } catch (error) {
        // Handle race condition: unique constraint violation
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An application with this email already exists. Please try again or sign in.",
          });
        }

        // Re-throw TRPCErrors as-is
        if (error instanceof TRPCError) {
          throw error;
        }

        // Unexpected errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong. Please try again.",
        });
      }
    }),

  /**
   * Get application status by user email
   * Useful for checking if user already has an application
   */
  getByEmail: publicProcedure
    .input(applicationFormSchema.pick({ email: true }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        include: { application: true },
      });

      if (!user?.application) {
        return null;
      }

      return {
        status: user.application.status,
        createdAt: user.application.createdAt,
        feedback: user.application.feedback,
      };
    }),

  /**
   * Admin: Reject an application with refund
   *
   * Rejects the application, provides feedback, and issues a refund if payment was made.
   * Only accessible to admins.
   */
  reject: adminProcedure
    .input(
      z.object({
        applicationId: z.string().min(1, "Application ID is required"),
        feedback: z.string().min(10, "Please provide feedback (minimum 10 characters)").max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { applicationId, feedback } = input;

      // Get the application
      const application = await ctx.db.application.findUnique({
        where: { id: applicationId },
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Can only reject SUBMITTED applications (paid ones)
      if (application.status !== "SUBMITTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot reject application with status: ${application.status}`,
        });
      }

      // Process refund if payment was made
      let refundResult: { success: boolean; refundId?: string; error?: string } | null = null;
      if (application.stripePaymentId) {
        refundResult = await createRefund(application.stripePaymentId);
        if (!refundResult.success) {
          // Log the error but don't block the rejection
          // Admin can manually process refund if needed
          console.error(
            `Refund failed for application ${applicationId}:`,
            refundResult.error
          );
        }
      }

      // Update application status
      await ctx.db.application.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          feedback: feedback.trim(),
          reviewedAt: new Date(),
          reviewedBy: ctx.session.user.id,
        },
      });

      // TODO: Send rejection email (Story 1.9)

      return {
        success: true,
        refundProcessed: refundResult?.success ?? false,
        refundError: refundResult?.error,
      };
    }),
});
