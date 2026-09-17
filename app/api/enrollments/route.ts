import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { courses, enrollments, profiles } from "@/lib/db/schema";
import { createEnrollmentSchema } from "@/lib/validation/enrollment";

export async function GET() {
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

  const studentEnrollments = await db
    .select({
      id: enrollments.id,
      courseId: enrollments.courseId,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      approvedAt: enrollments.approvedAt,
      completedAt: enrollments.completedAt,
      expiredAt: enrollments.expiredAt,
      cancelledAt: enrollments.cancelledAt,
      terminationReason: enrollments.terminationReason,
      reEnrollmentRequestedAt: enrollments.reEnrollmentRequestedAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      courseStartAt: courses.startAt,
      courseEndAt: courses.endAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, user.id));

  return NextResponse.json({
    enrollments: studentEnrollments,
  });
}

export async function POST(request: NextRequest) {
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
        error: "Please complete your student profile before enrolling.",
        code: "PROFILE_INCOMPLETE",
      },
      { status: 400 },
    );
  }

  if (!profile.parentConsent) {
    return NextResponse.json(
      {
        error: "Parent/guardian consent is required before enrollment.",
        code: "PARENT_CONSENT_REQUIRED",
      },
      { status: 400 },
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

  const result = createEnrollmentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { courseId } = result.data;

  const course = await db.query.courses.findFirst({
    where: and(
      eq(courses.id, courseId),
      eq(courses.isPublished, true),
    ),
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 },
    );
  }

  const now = new Date();

  if (course.startAt && now < course.startAt) {
    return NextResponse.json(
      {
        error: "Enrollment is not open yet.",
        code: "ENROLLMENT_NOT_OPEN",
      },
      { status: 400 },
    );
  }

  if (course.endAt && now > course.endAt) {
    return NextResponse.json(
      {
        error: "This course has ended and enrollment is closed.",
        code: "COURSE_ENDED",
      },
      { status: 400 },
    );
  }

  /*
   * Only pending/active enrollments block a new request.
   *
   * Historical cancelled/completed/expired enrollments remain
   * untouched and do not prevent re-enrollment.
   */
  const existingActiveEnrollment =
    await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, user.id),
        eq(enrollments.courseId, course.id),
        inArray(enrollments.status, ["pending", "active"]),
      ),
    });

  if (existingActiveEnrollment) {
    return NextResponse.json(
      {
        error:
          "You already have a pending or active enrollment for this course.",
        code: "ALREADY_ENROLLED",
        enrollment: existingActiveEnrollment,
      },
      { status: 409 },
    );
  }

  try {
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId: user.id,
        courseId: course.id,
        status: "pending",
      })
      .returning();

    return NextResponse.json(
      {
        message: "Enrollment request submitted successfully.",
        enrollment,
      },
      { status: 201 },
    );
  } catch (error) {
    /*
     * The partial unique index also protects against a race where
     * two enrollment requests arrive at nearly the same time.
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
