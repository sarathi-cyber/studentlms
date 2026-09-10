import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { createCourseSchema } from "@/lib/validation/course";

export async function GET() {
  try {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        thumbnailUrl: courses.thumbnailUrl,
        level: courses.level,
        durationMinutes: courses.durationMinutes,
        isPublished: courses.isPublished,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
      })
      .from(courses)
      .where(eq(courses.isPublished, true))
      .orderBy(desc(courses.createdAt));

    return NextResponse.json({
      courses: result,
    });
  } catch (error) {
    console.error("List courses error:", error);

    return NextResponse.json(
      {
        error: "Unable to load courses.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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
    const body = await request.json();

    const parsed = createCourseSchema.safeParse(body);

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
        where: eq(courses.slug, parsed.data.slug),
      });

    if (existingCourse) {
      return NextResponse.json(
        {
          error: "A course with this slug already exists.",
        },
        { status: 409 },
      );
    }

    const [course] = await db
      .insert(courses)
      .values({
        title: parsed.data.title,
        slug: parsed.data.slug,
        description:
          parsed.data.description ?? null,
        thumbnailUrl:
          parsed.data.thumbnailUrl ?? null,
        level: parsed.data.level,
        durationMinutes:
          parsed.data.durationMinutes,
        isPublished: parsed.data.isPublished,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Course created successfully.",
        course,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create course error:", error);

    return NextResponse.json(
      {
        error: "Unable to create course.",
      },
      { status: 500 },
    );
  }
}
