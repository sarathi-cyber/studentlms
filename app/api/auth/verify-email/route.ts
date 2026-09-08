import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import {
  emailVerificationTokens,
  users,
} from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          error: "Verification token is required.",
        },
        { status: 400 },
      );
    }

    const tokenHash = hashToken(token);

    const verificationToken =
      await db.query.emailVerificationTokens.findFirst({
        where: (tokens, { eq }) =>
          eq(tokens.tokenHash, tokenHash),
      });

    if (!verificationToken) {
      return NextResponse.json(
        {
          error: "Invalid verification token.",
        },
        { status: 400 },
      );
    }

    if (verificationToken.usedAt) {
      return NextResponse.json(
        {
          error: "This verification token has already been used.",
        },
        { status: 400 },
      );
    }

    if (verificationToken.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          error: "This verification token has expired.",
        },
        { status: 400 },
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          emailVerified: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, verificationToken.userId));

      await tx
        .update(emailVerificationTokens)
        .set({
          usedAt: new Date(),
        })
        .where(
          eq(
            emailVerificationTokens.id,
            verificationToken.id,
          ),
        );
    });

    return NextResponse.json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      {
        error: "Unable to verify email.",
      },
      { status: 500 },
    );
  }
}