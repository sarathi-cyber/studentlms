import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { assignments, courses } from "@/lib/db/schema";

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
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
      createdAt: assignments.createdAt,
      updatedAt: assignments.updatedAt,
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .orderBy(desc(assignments.createdAt));

  return NextResponse.json({
    assignments: results,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();

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
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.courseId !== "string" ||
    typeof data.title !== "string" ||
    data.title.trim().length < 3
  ) {
    return NextResponse.json(
      {
        error:
          "courseId and a title of at least 3 characters are required.",
      },
      { status: 400 },
    );
  }

  if (
    data.maxMarks !== undefined &&
    (
      typeof data.maxMarks !== "number" ||
      !Number.isInteger(data.maxMarks) ||
      data.maxMarks <= 0
    )
  ) {
    return NextResponse.json(
      { error: "maxMarks must be a positive integer." },
      { status: 400 },
    );
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, data.courseId),
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found." },
      { status: 404 },
    );
  }

  const isPublished =
    typeof data.isPublished === "boolean"
      ? data.isPublished
      : false;

  if (isPublished && !course.isPublished) {
    return NextResponse.json(
      {
        error:
          "An assignment cannot be published while its course is unpublished.",
      },
      { status: 400 },
    );
  }

  const [created] = await db
    .insert(assignments)
    .values({
      courseId: data.courseId,
      title: data.title.trim(),
      description:
        typeof data.description === "string"
          ? data.description.trim()
          : null,
      instructions:
        typeof data.instructions === "string"
          ? data.instructions.trim()
          : null,
      maxMarks:
        typeof data.maxMarks === "number"
          ? data.maxMarks
          : 100,
      dueAt:
        typeof data.dueAt === "string"
          ? new Date(data.dueAt)
          : null,
      isPublished,
    })
    .returning();

  return NextResponse.json(
    {
      message: "Assignment created successfully.",
      assignment: created,
    },
    { status: 201 },
  );
}
