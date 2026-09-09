import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validation/auth";
import { eq } from "drizzle-orm";
import {
  getClientIp,
  rateLimit,
} from "@/lib/security/rate-limit";

export async function POST(request: Request)
 {
    const ip = getClientIp(request);

const limit = await rateLimit(
  `login:${ip}`,
  {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  },
);

if (!limit.success) {
  return NextResponse.json(
    {
      error:
        "Too many login attempts. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(
          Math.ceil(
            (limit.resetAt - Date.now()) / 1000,
          ),
        ),
      },
    },
  );
}
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid login details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    /*
     * Use the same generic error for all authentication
     * failures so we do not reveal whether an email exists.
     */
    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        {
          error: "This account is not available.",
        },
        { status: 403 },
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in.",
        },
        { status: 403 },
      );
    }

    const passwordValid = await verifyPassword(
      user.passwordHash,
      password,
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    await createSession(user.id);

    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Unable to log in.",
      },
      { status: 500 },
    );
  }
}