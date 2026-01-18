/**
 * Message tRPC Router
 *
 * Handles direct messaging between members.
 * Stories 6-1 through 6-6.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const messageRouter = createTRPCRouter({
  /**
   * Send a direct message (Story 6-1)
   */
  send: protectedProcedure
    .input(
      z.object({
        receiverId: z.string().min(1),
        content: z.string().min(1).max(5000),
        contextType: z.enum(["LISTING_INQUIRY", "BOOKING_COORDINATION", "GENERAL"]).optional(),
        contextId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { receiverId, content, contextType, contextId } = input;

      // Can't message yourself
      if (receiverId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot message yourself",
        });
      }

      // Verify receiver exists
      const receiver = await ctx.db.user.findUnique({
        where: { id: receiverId },
        select: { id: true, name: true },
      });

      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Create message
      const message = await ctx.db.message.create({
        data: {
          senderId: ctx.session.user.id,
          receiverId,
          content,
          contextType: contextType ?? "GENERAL",
          contextId,
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      // TODO: Trigger Pusher real-time notification here
      // For MVP, we'll poll or refetch

      return message;
    }),

  /**
   * Get all conversations (Story 6-2)
   *
   * Returns a list of unique conversations with the last message.
   */
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all messages where user is sender or receiver
    const messages = await ctx.db.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by conversation partner
    const conversationMap = new Map<
      string,
      {
        partnerId: string;
        partner: { id: string; name: string | null; image: string | null };
        lastMessage: typeof messages[0];
        unreadCount: number;
      }
    >();

    for (const message of messages) {
      const partnerId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const partner =
        message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(partnerId)) {
        // Count unread messages in this conversation
        const unreadCount = messages.filter(
          (m) =>
            m.senderId === partnerId &&
            m.receiverId === userId &&
            !m.isRead
        ).length;

        conversationMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: message,
          unreadCount,
        });
      }
    }

    return Array.from(conversationMap.values());
  }),

  /**
   * Get messages in a conversation thread (Story 6-2)
   */
  getThread: protectedProcedure
    .input(
      z.object({
        partnerId: z.string().min(1),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { partnerId, limit, cursor } = input;
      const userId = ctx.session.user.id;

      // Get partner info
      const partner = await ctx.db.user.findUnique({
        where: { id: partnerId },
        select: { id: true, name: true, image: true },
      });

      if (!partner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Get messages between the two users
      const messages = await ctx.db.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      // Mark unread messages as read
      await ctx.db.message.updateMany({
        where: {
          senderId: partnerId,
          receiverId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return {
        messages: messages.reverse(), // Return oldest first for display
        partner,
        nextCursor,
      };
    }),

  /**
   * Get unread message count (Story 6-6)
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.message.count({
      where: {
        receiverId: ctx.session.user.id,
        isRead: false,
      },
    });

    return { count };
  }),

  /**
   * Mark messages as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ partnerId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.message.updateMany({
        where: {
          senderId: input.partnerId,
          receiverId: ctx.session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      });

      return { success: true };
    }),

  /**
   * Get or create conversation with context (Story 6-4, 6-5)
   *
   * Used for pre-booking inquiries and post-booking coordination.
   */
  getOrCreateConversation: protectedProcedure
    .input(
      z.object({
        partnerId: z.string().min(1),
        contextType: z.enum(["LISTING_INQUIRY", "BOOKING_COORDINATION", "GENERAL"]),
        contextId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { partnerId, contextType, contextId } = input;

      // Get partner info
      const partner = await ctx.db.user.findUnique({
        where: { id: partnerId },
        select: { id: true, name: true, image: true },
      });

      if (!partner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Get context details
      let contextDetails = null;
      if (contextType === "LISTING_INQUIRY" && contextId) {
        contextDetails = await ctx.db.home.findUnique({
          where: { id: contextId },
          select: { id: true, title: true, location: true },
        });
      } else if (contextType === "BOOKING_COORDINATION" && contextId) {
        contextDetails = await ctx.db.reservation.findUnique({
          where: { id: contextId },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            home: { select: { title: true } },
          },
        });
      }

      return {
        partner,
        contextType,
        contextId,
        contextDetails,
      };
    }),
});
