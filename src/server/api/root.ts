import { adminRouter } from "~/server/api/routers/admin";
import { applicationRouter } from "~/server/api/routers/application";
import { bookingRouter } from "~/server/api/routers/booking";
import { listingRouter } from "~/server/api/routers/listing";
import { messageRouter } from "~/server/api/routers/message";
import { paymentRouter } from "~/server/api/routers/payment";
import { pointsRouter } from "~/server/api/routers/points";
import { postRouter } from "~/server/api/routers/post";
import { profileRouter } from "~/server/api/routers/profile";
import { searchRouter } from "~/server/api/routers/search";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  application: applicationRouter,
  booking: bookingRouter,
  listing: listingRouter,
  message: messageRouter,
  payment: paymentRouter,
  points: pointsRouter,
  post: postRouter,
  profile: profileRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
