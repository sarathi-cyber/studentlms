import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  assignments,
  assignmentSubmissions,
  courses,
  users,
  profiles,
} from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export async function GET(
  _request: NextRequest,
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

  const idResult = z.string().uuid().safeParse(id);

  if (!idResult.success) {
    return NextResponse.json(
      { error: "Invalid assignment ID." },
      { status: 400 },
    );
  }

  const assignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, id),
  });

  if (!assignment) {
    return NextResponse.json(
      { error: "Assignment not found." },
      { status: 404 },
    );
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, assignment.courseId),
  });

  const submissions = await db
    .select({
      id: assignmentSubmissions.id,
      userId: assignmentSubmissions.userId,
      submissionUrl: assignmentSubmissions.submissionUrl,
      submissionText: assignmentSubmissions.submissionText,
      submittedAt: assignmentSubmissions.submittedAt,
      marks: assignmentSubmissions.marks,
      feedback: assignmentSubmissions.feedback,
      gradedAt: assignmentSubmissions.gradedAt,
      gradedBy: assignmentSubmissions.gradedBy,
      studentEmail: users.email,
      studentName: profiles.fullName,
    })
    .from(assignmentSubmissions)
    .innerJoin(users, eq(assignmentSubmissions.userId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(assignmentSubmissions.assignmentId, id));

  return NextResponse.json({
    assignment: {
      ...assignment,
      course: course
        ? {
            id: course.id,
            title: course.title,
            slug: course.slug,
            isPublished: course.isPublished,
          }
        : null,
      submissions,
    },
  });
}

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

  const idResult = z.string().uuid().safeParse(id);

  if (!idResult.success) {
    return NextResponse.json(
      { error: "Invalid assignment ID." },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const data = body as Record<string, unknown>;

  const existing = await db.query.assignments.findFirst({
    where: eq(assignments.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Assignment not found." },
      { status: 404 },
    );
  }

  if (
    data.title !== undefined &&
    (
      typeof data.title !== "string" ||
      data.title.trim().length < 3
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Title must contain at least 3 characters.",
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
      {
        error:
          "maxMarks must be a positive integer.",
      },
      { status: 400 },
    );
  }

  if (
    data.dueAt !== undefined &&
    data.dueAt !== null &&
    !isValidDate(data.dueAt)
  ) {
    return NextResponse.json(
      {
        error: "dueAt must be a valid date.",
      },
      { status: 400 },
    );
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, existing.courseId),
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found." },
      { status: 404 },
    );
  }

  const requestedPublished =
    data.isPublished !== undefined
      ? data.isPublished
      : existing.isPublished;

  if (typeof requestedPublished !== "boolean") {
    return NextResponse.json(
      {
        error:
          "isPublished must be a boolean.",
      },
      { status: 400 },
    );
  }

  if (requestedPublished && !course.isPublished) {
    return NextResponse.json(
      {
        error:
          "An assignment cannot be published while its course is unpublished.",
      },
      { status: 400 },
    );
  }

  const updateData: {
    title?: string;
    description?: string | null;
    instructions?: string | null;
    maxMarks?: number;
    dueAt?: Date | null;
    isPublished?: boolean;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) {
    updateData.title = (data.title as string).trim();
  }

  if (data.description !== undefined) {
    updateData.description =
      typeof data.description === "string"
        ? data.description.trim()
        : null;
  }

  if (data.instructions !== undefined) {
    updateData.instructions =
      typeof data.instructions === "string"
        ? data.instructions.trim()
        : null;
  }

  if (data.maxMarks !== undefined) {
    updateData.maxMarks = data.maxMarks as number;
  }

  if (data.dueAt !== undefined) {
    updateData.dueAt =
      data.dueAt === null
        ? null
        : new Date(data.dueAt as string);
  }

  if (data.isPublished !== undefined) {
    updateData.isPublished = data.isPublished as boolean;
  }

  const [updated] = await db
    .update(assignments)
    .set(updateData)
    .where(eq(assignments.id, id))
    .returning();

  return NextResponse.json({
    message: "Assignment updated successfully.",
    assignment: updated,
  });
}

export async function DELETE(
  _request: NextRequest,
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

  const idResult = z.string().uuid().safeParse(id);

  if (!idResult.success) {
    return NextResponse.json(
      { error: "Invalid assignment ID." },
      { status: 400 },
    );
  }

  const existing = await db.query.assignments.findFirst({
    where: eq(assignments.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Assignment not found." },
      { status: 404 },
    );
  }

  await db
    .delete(assignments)
    .where(eq(assignments.id, id));

  return NextResponse.json({
    message: "Assignment deleted successfully.",
  });
}
