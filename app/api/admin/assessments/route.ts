import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { assessments, courses } from "@/lib/db/schema";
import { createAssessmentSchema } from "@/lib/validation/assessment";

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
      id: assessments.id,
      courseId: assessments.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      title: assessments.title,
      description: assessments.description,
      instructions: assessments.instructions,
      durationMinutes: assessments.durationMinutes,
      passPercentage: assessments.passPercentage,
      isPublished: assessments.isPublished,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt,
    })
    .from(assessments)
    .innerJoin(courses, eq(assessments.courseId, courses.id))
    .orderBy(desc(assessments.createdAt));

  return NextResponse.json({
    assessments: results,
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

  const result = createAssessmentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const {
    courseId,
    title,
    description,
    instructions,
    durationMinutes,
    passPercentage,
    isPublished,
  } = result.data;

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 },
    );
  }

  if (isPublished && !course.isPublished) {
    return NextResponse.json(
      {
        error:
          "An assessment cannot be published while its course is unpublished.",
      },
      { status: 400 },
    );
  }

  const [created] = await db
    .insert(assessments)
    .values({
      courseId,
      title,
      description: description ?? null,
      instructions: instructions ?? null,
      durationMinutes,
      passPercentage,
      isPublished,
    })
    .returning();

  return NextResponse.json(
    {
      message: "Assessment created successfully.",
      assessment: created,
    },
    { status: 201 },
  );
}
