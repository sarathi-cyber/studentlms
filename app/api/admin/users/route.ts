import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import argon2 from "argon2";

import { db } from "@/lib/db";
import { adminPermissions, users } from "@/lib/db/schema";
import { requireSuperAdmin } from "@/lib/auth/authorization";

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/;

const allowedRoles = ["admin", "sub_admin"] as const;

export async function GET() {
  const auth = await requireSuperAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const adminUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.role, "admin"));

  const subAdmins = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.role, "sub_admin"));

  return NextResponse.json({
    users: [...adminUsers, ...subAdmins].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    ),
  });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { email, password, role } = body as {
    email?: unknown;
    password?: unknown;
    role?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (
    typeof role !== "string" ||
    !allowedRoles.includes(role as (typeof allowedRoles)[number])
  ) {
    return NextResponse.json(
      { error: "Role must be admin or sub_admin." },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length < 5 ||
    normalizedEmail.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (!passwordPattern.test(password)) {
    return NextResponse.json(
      {
        error:
          "Password must be 12-128 characters and include uppercase, lowercase, number, and special character.",
      },
      { status: 400 },
    );
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
    columns: {
      id: true,
    },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  const createdUser = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        role: role as "admin" | "sub_admin",
        status: "active",
        emailVerified: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      });

    if (role === "sub_admin") {
      await tx.insert(adminPermissions).values({
        userId: user.id,
      });
    }

    return user;
  });

  return NextResponse.json(
    {
      success: true,
      user: createdUser,
    },
    { status: 201 },
  );
}
