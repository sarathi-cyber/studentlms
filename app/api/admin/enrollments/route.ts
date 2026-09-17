import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  courses,
  enrollments,
  profiles,
  users,
} from "@/lib/db/schema";

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
      enrollmentId: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,

      status: enrollments.status,

      enrolledAt: enrollments.enrolledAt,
      approvedAt: enrollments.approvedAt,
      completedAt: enrollments.completedAt,
      expiredAt: enrollments.expiredAt,
      cancelledAt: enrollments.cancelledAt,
      terminationReason: enrollments.terminationReason,
      reEnrollmentRequestedAt: enrollments.reEnrollmentRequestedAt,

      studentEmail: users.email,

      fullName: profiles.fullName,
      dateOfBirth: profiles.dateOfBirth,
      educationLevel: profiles.educationLevel,
      classOrYear: profiles.classOrYear,
      institution: profiles.institution,
      schoolOrCollege: profiles.schoolOrCollege,
      phone: profiles.phone,
      parentGuardianName: profiles.parentGuardianName,
      parentGuardianContact: profiles.parentGuardianContact,
      parentConsent: profiles.parentConsent,

      courseTitle: courses.title,
      courseSlug: courses.slug,
      courseStartAt: courses.startAt,
      courseEndAt: courses.endAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .orderBy(desc(enrollments.enrolledAt));

  return NextResponse.json({
    enrollments: results,
  });
}
