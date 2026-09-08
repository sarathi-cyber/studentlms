import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  sessions,
  users,
} from "@/lib/db/schema";
import {
  generateToken,
  hashToken,
} from "@/lib/auth/tokens";

const SESSION_COOKIE_NAME = "techvora_session";

const SESSION_DURATION_MS =
  7 * 24 * 60 * 60 * 1000;

export async function createSession(
  userId: string,
): Promise<void> {
  const sessionToken = generateToken(32);
  const sessionTokenHash = hashToken(sessionToken);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_MS,
  );

  await db.insert(sessions).values({
    userId,
    sessionTokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    const sessionTokenHash = hashToken(sessionToken);

    await db
      .delete(sessions)
      .where(
        eq(
          sessions.sessionTokenHash,
          sessionTokenHash,
        ),
      );
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const sessionTokenHash = hashToken(sessionToken);

  const result = await db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(
      users,
      eq(sessions.userId, users.id),
    )
    .where(
      eq(
        sessions.sessionTokenHash,
        sessionTokenHash,
      ),
    )
    .limit(1);

  const session = result[0];

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await db
      .delete(sessions)
      .where(eq(sessions.id, session.sessionId));

    return null;
  }

  if (session.status !== "active") {
    return null;
  }

  await db
    .update(sessions)
    .set({
      lastActivityAt: new Date(),
    })
    .where(eq(sessions.id, session.sessionId));

  return {
    id: session.userId,
    email: session.email,
    role: session.role,
    status: session.status,
  };
}