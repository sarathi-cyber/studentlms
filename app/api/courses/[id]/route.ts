import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { updateCourseSchema } from "@/lib/validation/course";

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
      with: {
        modules: {
          with: {
            lessons: true,
          },
        },
      },
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

    return NextResponse.json({
      course,
    });
  } catch (error) {
    console.error("Get course error:", error);

    return NextResponse.json(
      {
        error: "Unable to load course.",
      },
      { status: 500 },
    );
  }
}

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
    const { id } = await context.params;

    const body = await request.json();

    const parsed = updateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid course details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const existingCourse =
      await db.query.courses.findFirst({
        where: eq(courses.id, id),
      });

    if (!existingCourse) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        { status: 404 },
      );
    }

    if (
      parsed.data.slug &&
      parsed.data.slug !== existingCourse.slug
    ) {
      const slugOwner =
        await db.query.courses.findFirst({
          where: eq(courses.slug, parsed.data.slug),
        });

      if (slugOwner) {
        return NextResponse.json(
          {
            error:
              "A course with this slug already exists.",
          },
          { status: 409 },
        );
      }
    }

    const [updatedCourse] = await db
      .update(courses)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    return NextResponse.json({
      message: "Course updated successfully.",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);

    return NextResponse.json(
      {
        error: "Unable to update course.",
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
    const { id } = await context.params;

    const existingCourse =
      await db.query.courses.findFirst({
        where: eq(courses.id, id),
      });

    if (!existingCourse) {
      return NextResponse.json(
        {
          error: "Course not found.",
        },
        { status: 404 },
      );
    }

    await db
      .delete(courses)
      .where(eq(courses.id, id));

    return NextResponse.json({
      message: "Course deleted successfully.",
    });
  } catch (error) {
    console.error("Delete course error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete course.",
      },
      { status: 500 },
    );
  }
}
