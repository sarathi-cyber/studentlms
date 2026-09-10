import { count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  courses,
  enrollments,
  users,
} from "@/lib/db/schema";

export async function getAdminDashboardStats() {
  const [
    studentCountResult,
    courseCountResult,
    publishedCourseCountResult,
    enrollmentCountResult,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "student")),

    db
      .select({ count: count() })
      .from(courses),

    db
      .select({ count: count() })
      .from(courses)
      .where(eq(courses.isPublished, true)),

    db
      .select({ count: count() })
      .from(enrollments),
  ]);

  return {
    students: Number(studentCountResult[0]?.count ?? 0),
    courses: Number(courseCountResult[0]?.count ?? 0),
    publishedCourses: Number(
      publishedCourseCountResult[0]?.count ?? 0,
    ),
    enrollments: Number(enrollmentCountResult[0]?.count ?? 0),
  };
}

export async function getRecentStudents() {
  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(desc(users.createdAt))
    .limit(5);
}

export async function getRecentEnrollments() {
  return db
    .select({
      id: enrollments.id,
      userEmail: users.email,
      courseTitle: courses.title,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .orderBy(desc(enrollments.enrolledAt))
    .limit(5);
}

export async function getRecentCourses() {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      level: courses.level,
      isPublished: courses.isPublished,
      durationMinutes: courses.durationMinutes,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .orderBy(desc(courses.createdAt))
    .limit(5);
}
