import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { courses, courseModules, lessons } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/authorization";
import { updateLessonSchema } from "@/lib/validation/lesson";

type RouteContext = {
  params: Promise<{
    moduleId: string;
    lessonId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { moduleId, lessonId } = await params;
    const authorization = await requireAdmin();
    const isAdmin =
      authorization.authorized &&
      authorization.user.role === "admin";

    const result = await db
      .select({
        lesson: lessons,
        module: courseModules,
        course: courses,
      })
      .from(lessons)
      .innerJoin(
        courseModules,
        eq(lessons.moduleId, courseModules.id),
      )
      .innerJoin(
        courses,
        eq(courseModules.courseId, courses.id),
      )
      .where(
        and(
          eq(lessons.id, lessonId),
          eq(lessons.moduleId, moduleId),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 },
      );
    }

    const { lesson, course } = result[0];

    if (!course.isPublished && !isAdmin) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 },
      );
    }

    if (!lesson.isPublished && !isAdmin) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ lesson }, { status: 200 });
  } catch (error) {
    console.error("GET lesson error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const authorization = await requireAdmin();

    if (!authorization.authorized) {
      return NextResponse.json(
        { error: authorization.error },
        { status: authorization.status },
      );
    }

    const { moduleId, lessonId } = await params;

    const existing = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.id, lessonId),
          eq(lessons.moduleId, moduleId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateLessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request data.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const updates = parsed.data;

    if (updates.slug !== undefined) {
      const duplicate = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(
          and(
            eq(lessons.moduleId, moduleId),
            eq(lessons.slug, updates.slug),
          ),
        )
        .limit(1);

      if (
        duplicate.length > 0 &&
        duplicate[0].id !== lessonId
      ) {
        return NextResponse.json(
          {
            error:
              "A lesson with this slug already exists in this module.",
          },
          { status: 409 },
        );
      }
    }

    const updated = await db
      .update(lessons)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(lessons.id, lessonId),
          eq(lessons.moduleId, moduleId),
        ),
      )
      .returning();

    return NextResponse.json(
      { lesson: updated[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH lesson error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const authorization = await requireAdmin();

    if (!authorization.authorized) {
      return NextResponse.json(
        { error: authorization.error },
        { status: authorization.status },
      );
    }

    const { moduleId, lessonId } = await params;

    const existing = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.id, lessonId),
          eq(lessons.moduleId, moduleId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 },
      );
    }

    await db
      .delete(lessons)
      .where(
        and(
          eq(lessons.id, lessonId),
          eq(lessons.moduleId, moduleId),
        ),
      );

    return NextResponse.json(
      { message: "Lesson deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE lesson error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
