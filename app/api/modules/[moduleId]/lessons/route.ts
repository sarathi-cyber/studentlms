import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  courseModules,
  lessons,
} from "@/lib/db/schema";
import { createLessonSchema } from "@/lib/validation/lesson";

type RouteContext = {
  params: Promise<{
    moduleId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { moduleId } = await context.params;

    const module = await db.query.courseModules.findFirst({
      where: eq(courseModules.id, moduleId),
      with: {
        course: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        {
          error: "Module not found.",
        },
        { status: 404 },
      );
    }

    const authorization = await requireAdmin();

    const isAdmin = authorization.authorized;

    if (!module.course.isPublished && !isAdmin) {
      return NextResponse.json(
        {
          error: "Module not found.",
        },
        { status: 404 },
      );
    }

    const lessonsList = await db.query.lessons.findMany({
      where: isAdmin
        ? eq(lessons.moduleId, moduleId)
        : and(
            eq(lessons.moduleId, moduleId),
            eq(lessons.isPublished, true),
          ),
      orderBy: asc(lessons.position),
    });

    return NextResponse.json({
      lessons: lessonsList,
    });
  } catch (error) {
    console.error("Get lessons error:", error);

    return NextResponse.json(
      {
        error: "Unable to load lessons.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const authorization = await requireAdmin();

  if (!authorization.authorized) {
    return NextResponse.json(
      {
        error: authorization.error,
      },
      { status: authorization.status },
    );
  }

  try {
    const { moduleId } = await context.params;

    const module = await db.query.courseModules.findFirst({
      where: eq(courseModules.id, moduleId),
    });

    if (!module) {
      return NextResponse.json(
        {
          error: "Module not found.",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const parsed = createLessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid lesson details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const existingLesson =
      await db.query.lessons.findFirst({
        where: and(
          eq(lessons.moduleId, moduleId),
          eq(lessons.slug, parsed.data.slug),
        ),
      });

    if (existingLesson) {
      return NextResponse.json(
        {
          error:
            "A lesson with this slug already exists in this module.",
        },
        { status: 409 },
      );
    }

    const [lesson] = await db
      .insert(lessons)
      .values({
        moduleId,
        ...parsed.data,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Lesson created successfully.",
        lesson,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create lesson error:", error);

    return NextResponse.json(
      {
        error: "Unable to create lesson.",
      },
      { status: 500 },
    );
  }
}
