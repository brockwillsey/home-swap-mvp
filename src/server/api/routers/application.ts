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
import { applicationFormSchema, calculateMembershipFee, type MembershipRoleType } from "~/lib/validations/application";
import { createRefund } from "~/lib/services/stripe";
import {
  sendWelcomeEmail,
  sendRejectionEmail,
  sendInfoRequestEmail,
} from "~/lib/services/resend";

/**
 * Get and validate the base URL for email links
 * Warns if NEXTAUTH_URL is not set (would cause broken links in production)
 */
function getBaseUrl(): string {
  const baseUrl = process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    console.warn(
      "NEXTAUTH_URL is not set - email links will use localhost. " +
      "This MUST be configured in production!"
    );
    return "http://localhost:3000";
  }
  return baseUrl;
}

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
      const { roles, email, name, bio, location, portfolioUrl, studioGalleryReferral, reasonForJoining, profilePhotoUrl, homePhotos, promoCode } = input;

      // Calculate membership fee based on roles
      const membershipFee = calculateMembershipFee(roles as MembershipRoleType[]);

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
                roles: JSON.stringify(roles),
                bio,
                location,
                portfolioUrl: portfolioUrl || null,
                studioGalleryReferral,
                reasonForJoining,
                profilePhotoUrl,
                homePhotos: JSON.stringify(homePhotos ?? []),
                membershipFee,
                promoCode: promoCode || null,
                feedback: null, // Clear previous feedback
                stripePaymentId: null, // Clear previous payment ID for new application
                stripeSubscriptionId: null, // Clear previous subscription ID
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
              roles: JSON.stringify(roles),
              bio,
              location,
              portfolioUrl: portfolioUrl || null,
              studioGalleryReferral,
              reasonForJoining,
              profilePhotoUrl,
              homePhotos: JSON.stringify(homePhotos ?? []),
              membershipFee,
              promoCode: promoCode || null,
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
    .input(z.object({ email: z.string().email() }))
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

      // Send rejection email (Story 1.9)
      let emailSent = false;
      try {
        await sendRejectionEmail({
          email: application.user.email,
          name: application.user.name ?? "Applicant",
          feedback: feedback.trim(),
          refundProcessed: refundResult?.success ?? false,
        });
        emailSent = true;
      } catch (emailError) {
        // Log email error but don't fail the rejection
        console.error("Failed to send rejection email:", emailError);
      }

      return {
        success: true,
        emailSent,
        refundProcessed: refundResult?.success ?? false,
        refundError: refundResult?.error,
      };
    }),

  /**
   * Admin: Approve an application
   *
   * Approves the application and sends a welcome email to the new member.
   * Only accessible to admins.
   */
  approve: adminProcedure
    .input(
      z.object({
        applicationId: z.string().min(1, "Application ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { applicationId } = input;

      // Get the application
      const application = await ctx.db.application.findUnique({
        where: { id: applicationId },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Can only approve SUBMITTED applications (paid ones)
      if (application.status !== "SUBMITTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot approve application with status: ${application.status}`,
        });
      }

      // Update application status and sync profile data to user
      await ctx.db.$transaction([
        ctx.db.application.update({
          where: { id: applicationId },
          data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedBy: ctx.session.user.id,
          },
        }),
        // Sync application profile data to user record
        ctx.db.user.update({
          where: { id: application.user.id },
          data: {
            bio: application.bio,
            location: application.location,
            creativeInterests: application.roles, // Store roles in creativeInterests field
            image: application.profilePhotoUrl,
          },
        }),
      ]);

      // Send welcome email (Story 1.9)
      const loginUrl = `${getBaseUrl()}/auth/signin`;

      let emailSent = false;
      try {
        await sendWelcomeEmail({
          email: application.user.email,
          name: application.user.name ?? "New Member",
          loginUrl,
        });
        emailSent = true;
      } catch (emailError) {
        // Log email error but don't fail the approval
        console.error("Failed to send welcome email:", emailError);
      }

      return {
        success: true,
        emailSent,
      };
    }),

  /**
   * Admin: Request more information from applicant
   *
   * Sets application to NEEDS_INFO status and sends email asking for specific info.
   * Only accessible to admins.
   */
  requestMoreInfo: adminProcedure
    .input(
      z.object({
        applicationId: z.string().min(1, "Application ID is required"),
        requestedInfo: z.string().min(10, "Please specify what information is needed (minimum 10 characters)").max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { applicationId, requestedInfo } = input;

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

      // Can only request info from SUBMITTED applications
      if (application.status !== "SUBMITTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot request info for application with status: ${application.status}`,
        });
      }

      // Update application status
      await ctx.db.application.update({
        where: { id: applicationId },
        data: {
          status: "NEEDS_INFO",
          feedback: requestedInfo.trim(), // Store the request in feedback field
          reviewedAt: new Date(),
          reviewedBy: ctx.session.user.id,
        },
      });

      // Send info request email (Story 1.9)
      const updateUrl = `${getBaseUrl()}/apply`; // User can reapply/update at /apply

      let emailSent = false;
      try {
        await sendInfoRequestEmail({
          email: application.user.email,
          name: application.user.name ?? "Applicant",
          requestedInfo: requestedInfo.trim(),
          updateUrl,
        });
        emailSent = true;
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error("Failed to send info request email:", emailError);
      }

      return {
        success: true,
        emailSent,
      };
    }),

  /**
   * Admin: List pending applications
   *
   * Returns applications sorted by submission date (oldest first).
   * Only accessible to admins.
   */
  listPending: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "SUBMITTED", "NEEDS_INFO"]).optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const status = input?.status ?? "SUBMITTED";
      const limit = input?.limit ?? 50;

      const applications = await ctx.db.application.findMany({
        where: { status },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "asc" }, // Oldest first
        take: limit,
      });

      return applications.map((app) => ({
        id: app.id,
        userId: app.user.id,
        email: app.user.email,
        name: app.user.name,
        profilePhotoUrl: app.profilePhotoUrl,
        location: app.location,
        status: app.status,
        createdAt: app.createdAt,
        feedback: app.feedback,
      }));
    }),

  /**
   * Admin: Get full application details
   *
   * Returns complete application data for admin review.
   * Only accessible to admins.
   */
  getDetails: adminProcedure
    .input(
      z.object({
        applicationId: z.string().min(1, "Application ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const application = await ctx.db.application.findUnique({
        where: { id: input.applicationId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
            },
          },
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      return {
        id: application.id,
        user: application.user,
        status: application.status,
        roles: application.roles,
        bio: application.bio,
        location: application.location,
        portfolioUrl: application.portfolioUrl,
        studioGalleryReferral: application.studioGalleryReferral,
        reasonForJoining: application.reasonForJoining,
        profilePhotoUrl: application.profilePhotoUrl,
        homePhotos: application.homePhotos,
        membershipFee: application.membershipFee,
        feedback: application.feedback,
        stripePaymentId: application.stripePaymentId,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        reviewedAt: application.reviewedAt,
        reviewedBy: application.reviewedBy,
      };
    }),
});
