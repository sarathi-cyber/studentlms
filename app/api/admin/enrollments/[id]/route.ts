import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { enrollments } from "@/lib/db/schema";
import { updateEnrollmentStatusSchema } from "@/lib/validation/enrollment";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = updateEnrollmentStatusSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existing = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Enrollment not found" },
      { status: 404 },
    );
  }

  /*
   * Admin approval:
   * pending -> active
   */
  if (result.data.status === "active") {
    if (existing.status !== "pending") {
      return NextResponse.json(
        {
          error:
            "Only pending enrollments can be approved.",
        },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(enrollments)
      .set({
        status: "active",
        approvedAt: new Date(),
        approvedBy: auth.user.id,
      })
      .where(eq(enrollments.id, id))
      .returning();

    return NextResponse.json({
      message: "Enrollment approved successfully.",
      enrollment: updated,
    });
  }

  /*
   * Admin termination:
   * pending/active -> cancelled
   */
  if (result.data.status === "cancelled") {
    if (
      existing.status !== "pending" &&
      existing.status !== "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Only pending or active enrollments can be cancelled.",
        },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(enrollments)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        terminationReason: result.data.terminationReason,
        reEnrollmentRequestedAt: null,
      })
      .where(eq(enrollments.id, id))
      .returning();

    return NextResponse.json({
      message: "Enrollment terminated successfully.",
      enrollment: updated,
    });
  }

  return NextResponse.json(
    { error: "Unsupported enrollment status change." },
    { status: 400 },
  );
}
