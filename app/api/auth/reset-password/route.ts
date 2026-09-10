import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import {
  passwordResetTokens,
  sessions,
  users,
} from "@/lib/db/schema";
import { resetPasswordSchema } from "@/lib/validation/auth";
import {
  getClientIp,
  rateLimit,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const limit = await rateLimit(
    `reset-password:${ip}`,
    {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    },
  );

  if (!limit.success) {
    return NextResponse.json(
      {
        error:
          "Too many password reset attempts. Please try again later.",
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

    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid password reset details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    const tokenHash = hashToken(token);

    const resetToken =
      await db.query.passwordResetTokens.findFirst({
        where: and(
          eq(
            passwordResetTokens.tokenHash,
            tokenHash,
          ),
          isNull(passwordResetTokens.usedAt),
        ),
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          error: "Invalid or expired password reset token.",
        },
        { status: 400 },
      );
    }

    if (resetToken.expiresAt <= new Date()) {
      await db
        .update(passwordResetTokens)
        .set({
          usedAt: new Date(),
        })
        .where(
          eq(
            passwordResetTokens.id,
            resetToken.id,
          ),
        );

      return NextResponse.json(
        {
          error: "Invalid or expired password reset token.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, resetToken.userId));

      /*
       * A password change invalidates all existing
       * sessions for security.
       */
      await tx
        .delete(sessions)
        .where(eq(sessions.userId, resetToken.userId));

      /*
       * Mark the reset token as used so it cannot
       * be replayed.
       */
      await tx
        .update(passwordResetTokens)
        .set({
          usedAt: new Date(),
        })
        .where(
          eq(
            passwordResetTokens.id,
            resetToken.id,
          ),
        );
    });

    return NextResponse.json({
      message:
        "Password reset successful. Please log in again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        error: "Unable to reset password.",
      },
      { status: 500 },
    );
  }
}