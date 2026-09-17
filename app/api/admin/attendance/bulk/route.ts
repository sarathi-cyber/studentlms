import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  attendanceRecords,
  courses,
  enrollments,
  users,
} from "@/lib/db/schema";
import { bulkAttendanceSchema } from "@/lib/validation/attendance";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const result = bulkAttendanceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid bulk attendance data.",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = result.data;

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, data.courseId),
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found." },
      { status: 404 },
    );
  }

  if (!course.isPublished) {
    return NextResponse.json(
      {
        error:
          "Attendance can only be marked for published courses.",
      },
      { status: 400 },
    );
  }

  const userIds = data.records.map((record) => record.userId);

  const uniqueUserIds = new Set(userIds);

  if (uniqueUserIds.size !== userIds.length) {
    return NextResponse.json(
      {
        error:
          "Each student can only appear once in a bulk attendance request.",
      },
      { status: 400 },
    );
  }

  const students = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(inArray(users.id, userIds));

  if (students.length !== userIds.length) {
    return NextResponse.json(
      {
        error:
          "One or more students in the request were not found.",
      },
      { status: 404 },
    );
  }

  const nonStudents = students.filter(
    (student) => student.role !== "student",
  );

  if (nonStudents.length > 0) {
    return NextResponse.json(
      {
        error:
          "Attendance can only be recorded for students.",
      },
      { status: 400 },
    );
  }

  const activeEnrollments = await db
    .select({
      userId: enrollments.userId,
    })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.courseId, data.courseId),
        eq(enrollments.status, "active"),
        inArray(enrollments.userId, userIds),
      ),
    );

  const activeUserIds = new Set(
    activeEnrollments.map((enrollment) => enrollment.userId),
  );

  const unenrolledStudents = userIds.filter(
    (userId) => !activeUserIds.has(userId),
  );

  if (unenrolledStudents.length > 0) {
    return NextResponse.json(
      {
        error:
          "Every student in the request must have an active enrollment in this course.",
        userIds: unenrolledStudents,
      },
      { status: 400 },
    );
  }

  const existingRecords = await db
    .select({
      userId: attendanceRecords.userId,
    })
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.courseId, data.courseId),
        eq(attendanceRecords.attendanceDate, data.attendanceDate),
        inArray(attendanceRecords.userId, userIds),
      ),
    );

  if (existingRecords.length > 0) {
    return NextResponse.json(
      {
        error:
          "Attendance already exists for one or more students on this date.",
        userIds: existingRecords.map((record) => record.userId),
      },
      { status: 409 },
    );
  }

  try {
    const records = await db.transaction(async (tx) => {
      return tx
        .insert(attendanceRecords)
        .values(
          data.records.map((record) => ({
            courseId: data.courseId,
            userId: record.userId,
            attendanceDate: data.attendanceDate,
            status: record.status,
            remarks: record.remarks ?? null,
            markedBy: auth.user.id,
          })),
        )
        .returning();
    });

    return NextResponse.json(
      {
        message: "Bulk attendance recorded successfully.",
        count: records.length,
        records,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Bulk attendance creation error:", error);

    return NextResponse.json(
      { error: "Unable to record bulk attendance." },
      { status: 500 },
    );
  }
}
