import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  assignments,
  assignmentSubmissions,
  courses,
  enrollments,
} from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
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

  const { id } = await params;

  const idResult = z.string().uuid().safeParse(id);

  if (!idResult.success) {
    return NextResponse.json(
      { error: "Invalid assignment ID." },
      { status: 400 },
    );
  }

  const assignment = await db
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
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(
      and(
        eq(assignments.id, id),
        eq(assignments.isPublished, true),
        eq(courses.isPublished, true),
      ),
    )
    .limit(1);

  if (!assignment[0]) {
    return NextResponse.json(
      { error: "Assignment not found." },
      { status: 404 },
    );
  }

  const enrollment = await db
    .select({
      id: enrollments.id,
      status: enrollments.status,
      endAt: courses.endAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.userId, user.id),
        eq(enrollments.courseId, assignment[0].courseId),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);

  if (!enrollment[0]) {
    return NextResponse.json(
      { error: "You do not have an active enrollment for this course." },
      { status: 403 },
    );
  }

  if (
    enrollment[0].endAt &&
    enrollment[0].endAt.getTime() <= Date.now()
  ) {
    return NextResponse.json(
      { error: "Your course enrollment has expired." },
      { status: 403 },
    );
  }

  const submission = await db
    .select({
      id: assignmentSubmissions.id,
      submissionUrl: assignmentSubmissions.submissionUrl,
      submissionText: assignmentSubmissions.submissionText,
      submittedAt: assignmentSubmissions.submittedAt,
      marks: assignmentSubmissions.marks,
      feedback: assignmentSubmissions.feedback,
      gradedAt: assignmentSubmissions.gradedAt,
    })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.id, assignmentSubmissions.id),
        eq(assignmentSubmissions.assignmentId, id),
        eq(assignmentSubmissions.userId, user.id),
      ),
    )
    .limit(1);

  return NextResponse.json({
    assignment: assignment[0],
    submission: submission[0] ?? null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
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

  const { id } = await params;

  const idResult = z.string().uuid().safeParse(id);

  if (!idResult.success) {
    return NextResponse.json(
      { error: "Invalid assignment ID." },
      { status: 400 },
    );
  }

  const assignment = await db
    .select({
      id: assignments.id,
      courseId: assignments.courseId,
      maxMarks: assignments.maxMarks,
      dueAt: assignments.dueAt,
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(
      and(
        eq(assignments.id, id),
        eq(assignments.isPublished, true),
        eq(courses.isPublished, true),
      ),
    )
    .limit(1);

  if (!assignment[0]) {
    return NextResponse.json(
      { error: "Assignment not found." },
      { status: 404 },
    );
  }

  const enrollment = await db
    .select({
      id: enrollments.id,
      status: enrollments.status,
      endAt: courses.endAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.userId, user.id),
        eq(enrollments.courseId, assignment[0].courseId),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);

  if (!enrollment[0]) {
    return NextResponse.json(
      { error: "You do not have an active enrollment for this course." },
      { status: 403 },
    );
  }

  if (
    enrollment[0].endAt &&
    enrollment[0].endAt.getTime() <= Date.now()
  ) {
    return NextResponse.json(
      { error: "Your course enrollment has expired." },
      { status: 403 },
    );
  }

  let body: {
    submissionUrl?: unknown;
    submissionText?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const submissionUrl =
    typeof body.submissionUrl === "string"
      ? body.submissionUrl.trim()
      : "";

  const submissionText =
    typeof body.submissionText === "string"
      ? body.submissionText.trim()
      : "";

  if (!submissionUrl && !submissionText) {
    return NextResponse.json(
      { error: "Provide a submission URL or submission text." },
      { status: 400 },
    );
  }

  if (submissionUrl.length > 5000) {
    return NextResponse.json(
      { error: "Submission URL is too long." },
      { status: 400 },
    );
  }

  if (submissionText.length > 50000) {
    return NextResponse.json(
      { error: "Submission text is too long." },
      { status: 400 },
    );
  }

  if (
    assignment[0].dueAt &&
    assignment[0].dueAt.getTime() < Date.now()
  ) {
    return NextResponse.json(
      { error: "The assignment submission deadline has passed." },
      { status: 400 },
    );
  }

  const existingSubmission = await db
    .select({
      id: assignmentSubmissions.id,
      marks: assignmentSubmissions.marks,
    })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.assignmentId, id),
        eq(assignmentSubmissions.userId, user.id),
      ),
    )
    .limit(1);

  if (existingSubmission[0]?.marks !== null && existingSubmission[0]?.marks !== undefined) {
    return NextResponse.json(
      {
        error:
          "This assignment has already been graded and cannot be resubmitted.",
      },
      { status: 400 },
    );
  }

  const submittedAt = new Date();

  if (existingSubmission[0]) {
    const updated = await db
      .update(assignmentSubmissions)
      .set({
        submissionUrl: submissionUrl || null,
        submissionText: submissionText || null,
        submittedAt,
        updatedAt: submittedAt,
      })
      .where(eq(assignmentSubmissions.id, existingSubmission[0].id))
      .returning();

    return NextResponse.json(
      {
        message: "Assignment resubmitted successfully.",
        submission: updated[0],
      },
      { status: 200 },
    );
  }

  const created = await db
    .insert(assignmentSubmissions)
    .values({
      assignmentId: id,
      userId: user.id,
      submissionUrl: submissionUrl || null,
      submissionText: submissionText || null,
      submittedAt,
    })
    .returning();

  return NextResponse.json(
    {
      message: "Assignment submitted successfully.",
      submission: created[0],
    },
    { status: 201 },
  );
}
