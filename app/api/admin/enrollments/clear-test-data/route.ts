import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { enrollments } from "@/lib/db/schema";

const TEST_USER_ID =
  "fc9dd42c-b7c2-45ee-b89b-c9610f179302";

const TEST_COURSE_IDS = [
  "30afbf99-4c83-4cd9-9d3f-ac90c707b4c8",
  "a9fcec37-2339-430c-b304-6fcaa48ed5af",
];

export async function DELETE() {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "Test data cleanup is disabled in production.",
      },
      { status: 403 },
    );
  }

  const deleted = await db
    .delete(enrollments)
    .where(
      and(
        eq(enrollments.userId, TEST_USER_ID),
        inArray(enrollments.courseId, TEST_COURSE_IDS),
      ),
    )
    .returning({
      id: enrollments.id,
    });

  return NextResponse.json({
    message: "Test enrollment logs cleared successfully.",
    deletedCount: deleted.length,
  });
}
