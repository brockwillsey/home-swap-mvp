import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";

// DEV ONLY - Direct login without email verification
export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "admin@artres.com";

  // Find or create user
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: { email, role: "ADMIN" },
    });
  }

  // Create session (expires in 30 days)
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const sessionToken = crypto.randomUUID();

  await db.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set("authjs.session-token", sessionToken, {
    expires,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  // Redirect to admin
  return NextResponse.redirect(new URL("/admin", request.url));
}
