import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  assessments,
  assessmentQuestions,
  assessmentOptions,
  courses,
} from "@/lib/db/schema";
import { updateAssessmentSchema } from "@/lib/validation/assessment";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, id),
  });

  if (!assessment) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 },
    );
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, assessment.courseId),
  });

  const questions = await db
    .select()
    .from(assessmentQuestions)
    .where(eq(assessmentQuestions.assessmentId, id))
    .orderBy(assessmentQuestions.position);

  const allOptions =
    questions.length > 0
      ? await db
          .select()
          .from(assessmentOptions)
      : [];

  const questionsWithOptions = questions.map((question) => ({
    ...question,
    options: allOptions
      .filter((option) => option.questionId === question.id)
      .sort((a, b) => a.position - b.position),
  }));

  return NextResponse.json({
    assessment: {
      ...assessment,
      course: course
        ? {
            id: course.id,
            title: course.title,
            slug: course.slug,
            isPublished: course.isPublished,
          }
        : null,
      questions: questionsWithOptions,
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = updateAssessmentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existing = await db.query.assessments.findFirst({
    where: eq(assessments.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 },
    );
  }

  if (result.data.isPublished === true) {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, existing.courseId),
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    if (!course.isPublished) {
      return NextResponse.json(
        {
          error:
            "An assessment cannot be published while its course is unpublished.",
        },
        { status: 400 },
      );
    }
  }

  const [updated] = await db
    .update(assessments)
    .set({
      ...result.data,
      updatedAt: new Date(),
    })
    .where(eq(assessments.id, id))
    .returning();

  return NextResponse.json({
    message: "Assessment updated successfully.",
    assessment: updated,
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

  const existing = await db.query.assessments.findFirst({
    where: eq(assessments.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 },
    );
  }

  await db
    .delete(assessments)
    .where(eq(assessments.id, id));

  return NextResponse.json({
    message: "Assessment deleted successfully.",
  });
}
