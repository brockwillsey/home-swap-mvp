import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { env } from "~/env";
import {
  resend,
  DEFAULT_FROM_EMAIL,
  getMagicLinkEmailHtml,
  getMagicLinkEmailText,
} from "~/lib/services/resend";

/**
 * Module augmentation for `next-auth` types.
 * Adds custom properties to the `session` object with type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: "MEMBER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

/**
 * NextAuth.js configuration for Art Res
 *
 * Magic Link authentication via Resend email provider
 * - 10 minute link expiration per acceptance criteria
 * - Art Res branded email template
 *
 * @see https://authjs.dev/getting-started/providers/resend
 */
export const authConfig = {
  providers: [
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: DEFAULT_FROM_EMAIL,
      // Magic link expires after 10 minutes per AC #2/#3
      maxAge: 10 * 60,
      // Custom branded email template
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const host = new URL(url).host;

        // Dev mode: log magic link to console instead of sending email
        if (process.env.NODE_ENV === "development") {
          console.log("\n" + "=".repeat(60));
          console.log("🔐 DEV MODE - Magic Link Login");
          console.log("=".repeat(60));
          console.log(`Email: ${email}`);
          console.log(`\n👉 Click here to sign in:\n${url}\n`);
          console.log("=".repeat(60) + "\n");
          return;
        }

        if (!resend) {
          console.error("RESEND_API_KEY not configured - cannot send magic link");
          throw new Error("Email service not configured. Please contact support.");
        }

        try {
          const { error } = await resend.emails.send({
            from: provider.from ?? DEFAULT_FROM_EMAIL,
            to: email,
            subject: "Sign in to Art Res",
            html: getMagicLinkEmailHtml(url, host),
            text: getMagicLinkEmailText(url, host),
          });

          if (error) {
            throw new Error(`Resend error: ${error.message}`);
          }
        } catch (error) {
          console.error("Failed to send magic link email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        // Cast to access role from Prisma User model via adapter
        role: (user as { role?: "MEMBER" | "ADMIN" }).role,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  // Trust the host header from Vercel
  trustHost: true,
} satisfies NextAuthConfig;
