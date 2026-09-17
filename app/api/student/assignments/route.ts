import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  assignments,
  courses,
  enrollments,
} from "@/lib/db/schema";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  if (user.role !== "student") {
    return NextResponse.json(
      { error: "Forbidden." },
      { status: 403 },
    );
  }

  const results = await db
    .select({
      id: assignments.id,
      courseId: assignments.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      title: assignments.title,
      description: assignments.description,
      instructions: assignments.instructions,
      maxMarks: assignments.maxMarks,
      dueAt: assignments.dueAt,
      isPublished: assignments.isPublished,
    })
    .from(assignments)
    .innerJoin(
      courses,
      eq(assignments.courseId, courses.id),
    )
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.courseId, courses.id),
        eq(enrollments.userId, user.id),
        eq(enrollments.status, "active"),
      ),
    )
    .where(
      and(
        eq(assignments.isPublished, true),
        eq(courses.isPublished, true),
      ),
    );

  return NextResponse.json({
    assignments: results,
  });
}
