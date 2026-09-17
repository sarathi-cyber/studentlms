import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { courses, enrollments, profiles } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  if (user.role !== "student") {
    return NextResponse.json(
      { error: "Student access required" },
      { status: 403 },
    );
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });

  if (!profile) {
    return NextResponse.json(
      {
        error: "Student profile not found",
        code: "PROFILE_NOT_FOUND",
      },
      { status: 400 },
    );
  }

  if (!profile.profileCompleted) {
    return NextResponse.json(
      {
        error:
          "Please complete your student profile before requesting re-enrollment.",
        code: "PROFILE_INCOMPLETE",
      },
      { status: 400 },
    );
  }

  if (!profile.parentConsent) {
    return NextResponse.json(
      {
        error:
          "Parent/guardian consent is required before requesting re-enrollment.",
        code: "PARENT_CONSENT_REQUIRED",
      },
      { status: 400 },
    );
  }

  const { id } = await context.params;

  const previousEnrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.id, id),
      eq(enrollments.userId, user.id),
    ),
  });

  if (!previousEnrollment) {
    return NextResponse.json(
      { error: "Enrollment not found" },
      { status: 404 },
    );
  }

  if (previousEnrollment.status !== "cancelled") {
    return NextResponse.json(
      {
        error:
          "Only cancelled enrollments can be used for re-enrollment.",
        code: "INVALID_REENROLLMENT_STATUS",
      },
      { status: 400 },
    );
  }

  const course = await db.query.courses.findFirst({
    where: and(
      eq(courses.id, previousEnrollment.courseId),
      eq(courses.isPublished, true),
    ),
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course is no longer available." },
      { status: 404 },
    );
  }

  const now = new Date();

  if (course.startAt && now < course.startAt) {
    return NextResponse.json(
      {
        error: "Re-enrollment is not open yet.",
        code: "REENROLLMENT_NOT_OPEN",
      },
      { status: 400 },
    );
  }

  if (course.endAt && now > course.endAt) {
    return NextResponse.json(
      {
        error:
          "This course has ended and re-enrollment is closed.",
        code: "COURSE_ENDED",
      },
      { status: 400 },
    );
  }

  /*
   * Only pending/active enrollments block a new request.
   * Historical cancelled/completed/expired enrollments are preserved.
   */
  const currentEnrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, user.id),
      eq(enrollments.courseId, course.id),
      inArray(enrollments.status, ["pending", "active"]),
    ),
  });

  if (currentEnrollment) {
    return NextResponse.json(
      {
        error:
          "You already have a pending or active enrollment for this course.",
        code: "ALREADY_ENROLLED",
        enrollment: currentEnrollment,
      },
      { status: 409 },
    );
  }

  const requestedAt = new Date();

  try {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        userId: user.id,
        courseId: course.id,
        status: "pending",
        reEnrollmentRequestedAt: requestedAt,
      })
      .returning();

    return NextResponse.json(
      {
        message:
          "Re-enrollment request submitted successfully.",
        enrollment: newEnrollment,
      },
      { status: 201 },
    );
  } catch (error) {
    /*
     * The partial unique index protects against concurrent
     * duplicate pending/active enrollment requests.
     */
    if (
      error instanceof Error &&
      error.message.includes(
        "enrollments_active_user_course_unique",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You already have a pending or active enrollment for this course.",
          code: "ALREADY_ENROLLED",
        },
        { status: 409 },
      );
    }

    throw error;
  }
}
