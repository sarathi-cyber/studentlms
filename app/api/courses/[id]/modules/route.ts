import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  courseModules,
  courses,
} from "@/lib/db/schema";
import { createCourseModuleSchema } from "@/lib/validation/module";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
    });

    if (!course) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        { status: 404 },
      );
    }

    if (!course.isPublished) {
      const authorization = await requireAdmin();

      if (!authorization.authorized) {
        return NextResponse.json(
          {
            error: "Course not found.",
          },
          { status: 404 },
        );
      }
    }

    const modules = await db.query.courseModules.findMany({
      where: eq(courseModules.courseId, id),
      orderBy: asc(courseModules.position),
      with: {
        lessons: true,
      },
    });

    return NextResponse.json({
      modules,
    });
  } catch (error) {
    console.error("Get course modules error:", error);

    return NextResponse.json(
      {
        error: "Unable to load course modules.",
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
    const { id } = await context.params;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, id),
    });

    if (!course) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const parsed = createCourseModuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid module details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const [module] = await db
      .insert(courseModules)
      .values({
        courseId: id,
        ...parsed.data,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Module created successfully.",
        module,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create course module error:", error);

    return NextResponse.json(
      {
        error: "Unable to create course module.",
      },
      { status: 500 },
    );
  }
}
