import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { courseModules, courses } from "@/lib/db/schema";
import { updateCourseModuleSchema } from "@/lib/validation/module";

type RouteContext = {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
};

export async function PATCH(
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
    const { id, moduleId } = await context.params;

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

    const existingModule =
      await db.query.courseModules.findFirst({
        where: and(
          eq(courseModules.id, moduleId),
          eq(courseModules.courseId, id),
        ),
      });

    if (!existingModule) {
      return NextResponse.json(
        {
          error: "Module not found.",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const parsed = updateCourseModuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid module details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const [updatedModule] = await db
      .update(courseModules)
      .set(parsed.data)
      .where(
        and(
          eq(courseModules.id, moduleId),
          eq(courseModules.courseId, id),
        ),
      )
      .returning();

    return NextResponse.json({
      message: "Module updated successfully.",
      module: updatedModule,
    });
  } catch (error) {
    console.error("Update course module error:", error);

    return NextResponse.json(
      {
        error: "Unable to update course module.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
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
    const { id, moduleId } = await context.params;

    const existingModule =
      await db.query.courseModules.findFirst({
        where: and(
          eq(courseModules.id, moduleId),
          eq(courseModules.courseId, id),
        ),
      });

    if (!existingModule) {
      return NextResponse.json(
        {
          error: "Module not found.",
        },
        { status: 404 },
      );
    }

    await db
      .delete(courseModules)
      .where(
        and(
          eq(courseModules.id, moduleId),
          eq(courseModules.courseId, id),
        ),
      );

    return NextResponse.json({
      message: "Module deleted successfully.",
    });
  } catch (error) {
    console.error("Delete course module error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete course module.",
      },
      { status: 500 },
    );
  }
}
