import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  courseModules,
  courses,
  enrollments,
  lessonProgress,
  lessons,
} from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{
    lessonId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Student access required." },
        { status: 403 },
      );
    }

    const { lessonId } = await context.params;

    const lesson = await db
      .select({
        lessonId: lessons.id,
        courseId: courses.id,
        isPublished: lessons.isPublished,
        coursePublished: courses.isPublished,
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
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (
      lesson.length === 0 ||
      !lesson[0].isPublished ||
      !lesson[0].coursePublished
    ) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 },
      );
    }

    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, user.id),
        eq(enrollments.courseId, lesson[0].courseId),
        eq(enrollments.status, "active"),
      ),
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Active course enrollment required." },
        { status: 403 },
      );
    }

    const progress = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, user.id),
        eq(lessonProgress.lessonId, lessonId),
      ),
    });

    return NextResponse.json(
      {
        progress: progress ?? {
          lessonId,
          progressPercent: 0,
          completedAt: null,
          lastAccessedAt: null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET lesson progress error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
