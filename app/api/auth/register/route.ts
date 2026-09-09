import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { hashPassword } from "@/lib/auth/password";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import {
  emailVerificationTokens,
  profiles,
  users,
} from "@/lib/db/schema";
import { registerSchema } from "@/lib/validation/auth";
import {
  getClientIp,
  rateLimit,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);

const limit = await rateLimit(
  `register:${ip}`,
  {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },
);

if (!limit.success) {
  return NextResponse.json(
    {
      error:
        "Too many registration attempts. Please try again later.",
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

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid registration details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password, fullName } = parsed.data;

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Unable to create account with these details.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const verificationToken = generateToken(32);
    const verificationTokenHash =
      hashToken(verificationToken);

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email,
          passwordHash,
          role: "student",
          status: "active",
        })
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
          status: users.status,
        });

      await tx.insert(profiles).values({
        userId: user.id,
        fullName,
      });

      await tx.insert(emailVerificationTokens).values({
        userId: user.id,
        tokenHash: verificationTokenHash,
        expiresAt: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ),
      });

      return user;
    });

        const origin = new URL(request.url).origin;

    const verificationUrl =
      `${origin}/api/auth/verify-email?token=${verificationToken}`;

    await sendVerificationEmail({
      email: result.email,
      fullName,
      verificationUrl,
    });

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please verify your email.",
        user: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error: "Unable to create account.",
      },
      { status: 500 },
    );
  }
}