import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  assignments,
  assignmentSubmissions,
  users,
  profiles,
} from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
    submissionId: string;
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

  const { id, submissionId } = await context.params;

  const assignmentIdResult = z.string().uuid().safeParse(id);

  if (!assignmentIdResult.success) {
    return NextResponse.json(
      { error: "Invalid assignment ID." },
      { status: 400 },
    );
  }

  const submissionIdResult = z.string().uuid().safeParse(submissionId);

  if (!submissionIdResult.success) {
    return NextResponse.json(
      { error: "Invalid submission ID." },
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

  if (
    typeof data.marks !== "number" ||
    !Number.isInteger(data.marks)
  ) {
    return NextResponse.json(
      {
        error:
          "marks must be an integer.",
      },
      { status: 400 },
    );
  }

  if (data.marks < 0) {
    return NextResponse.json(
      {
        error:
          "Marks cannot be negative.",
      },
      { status: 400 },
    );
  }

  if (
    data.feedback !== undefined &&
    data.feedback !== null &&
    typeof data.feedback !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          "feedback must be a string or null.",
      },
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

  if (data.marks > assignment.maxMarks) {
    return NextResponse.json(
      {
        error:
          `Marks cannot exceed the maximum of ${assignment.maxMarks}.`,
      },
      { status: 400 },
    );
  }

  const submission =
    await db.query.assignmentSubmissions.findFirst({
      where: eq(assignmentSubmissions.id, submissionId),
    });

  if (!submission) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  }

  if (submission.assignmentId !== id) {
    return NextResponse.json(
      {
        error:
          "Submission does not belong to this assignment.",
      },
      { status: 404 },
    );
  }

  const feedback =
    data.feedback === null
      ? null
      : typeof data.feedback === "string"
        ? data.feedback.trim()
        : undefined;

  const [updated] = await db
    .update(assignmentSubmissions)
    .set({
      marks: data.marks,
      feedback,
      gradedAt: new Date(),
      gradedBy: auth.user.id,
      updatedAt: new Date(),
    })
    .where(eq(assignmentSubmissions.id, submissionId))
    .returning();

  return NextResponse.json({
    message: "Assignment graded successfully.",
    submission: updated,
  });
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

  const { id, submissionId } = await context.params;

  const assignmentIdResult = z.string().uuid().safeParse(id);

  if (!assignmentIdResult.success) {
    return NextResponse.json(
      { error: "Invalid assignment ID." },
      { status: 400 },
    );
  }

  const submissionIdResult = z.string().uuid().safeParse(submissionId);

  if (!submissionIdResult.success) {
    return NextResponse.json(
      { error: "Invalid submission ID." },
      { status: 400 },
    );
  }

  const results = await db
    .select({
      submissionId: assignmentSubmissions.id,
      assignmentId: assignmentSubmissions.assignmentId,
      assignmentTitle: assignments.title,
      maxMarks: assignments.maxMarks,

      studentId: assignmentSubmissions.userId,
      studentEmail: users.email,
      studentName: profiles.fullName,

      submissionUrl: assignmentSubmissions.submissionUrl,
      submissionText: assignmentSubmissions.submissionText,
      submittedAt: assignmentSubmissions.submittedAt,

      marks: assignmentSubmissions.marks,
      feedback: assignmentSubmissions.feedback,
      gradedAt: assignmentSubmissions.gradedAt,
      gradedBy: assignmentSubmissions.gradedBy,
    })
    .from(assignmentSubmissions)
    .innerJoin(
      assignments,
      eq(
        assignmentSubmissions.assignmentId,
        assignments.id,
      ),
    )
    .innerJoin(
      users,
      eq(assignmentSubmissions.userId, users.id),
    )
    .leftJoin(
      profiles,
      eq(profiles.userId, users.id),
    )
    .where(eq(assignmentSubmissions.id, submissionId))
    .limit(1);

  const submission = results[0];

  if (!submission || submission.assignmentId !== id) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    submission,
  });
}
