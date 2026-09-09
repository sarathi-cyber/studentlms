import { NextResponse } from "next/server";

import { hashToken, generateToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import {
  passwordResetTokens,
  users,
} from "@/lib/db/schema";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { eq, and, isNull } from "drizzle-orm";
import {
  getClientIp,
  rateLimit,
} from "@/lib/security/rate-limit";

const RESET_TOKEN_DURATION_MS =
  60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
    const ip = getClientIp(request);

const limit = await rateLimit(
  `forgot-password:${ip}`,
  {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },
);

if (!limit.success) {
  return NextResponse.json(
    {
      error:
        "Too many password reset requests. Please try again later.",
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

    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid email address.",
        },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    /*
     * Always return the same response whether the
     * account exists or not. This prevents email
     * enumeration.
     */
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });
    }

    /*
     * Invalidate existing unused reset tokens.
     */
    await db
      .update(passwordResetTokens)
      .set({
        usedAt: new Date(),
      })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.usedAt),
        ),
      );

    const resetToken = generateToken(32);
    const resetTokenHash = hashToken(resetToken);

    if (process.env.NODE_ENV !== "production") {
  console.log("[DEV] Password reset token:", resetToken);
}

    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_DURATION_MS,
    );

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: resetTokenHash,
      expiresAt,
    });

    /*
     * Email delivery will be implemented in the
     * next authentication step.
     *
     * NEVER return resetToken in production.
     */

    console.log(
      `Password reset requested for ${user.email}`,
    );

    return NextResponse.json({
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        error: "Unable to process password reset request.",
      },
      { status: 500 },
    );
  }
}