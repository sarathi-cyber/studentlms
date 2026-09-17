import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import {
  attendanceRecords,
  courses,
  enrollments,
  profiles,
  users,
} from "@/lib/db/schema";
import {
  createAttendanceSchema,
} from "@/lib/validation/attendance";

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const courseId = request.nextUrl.searchParams.get("courseId");
  const attendanceDate =
    request.nextUrl.searchParams.get("attendanceDate");

  if (courseId) {
    const courseResult = z.string().uuid().safeParse(courseId);

    if (!courseResult.success) {
      return NextResponse.json(
        { error: "Invalid course ID." },
        { status: 400 },
      );
    }
  }

  if (attendanceDate && !isValidDate(attendanceDate)) {
    return NextResponse.json(
      { error: "Invalid attendance date." },
      { status: 400 },
    );
  }

  const conditions = [];

  if (courseId) {
    conditions.push(eq(attendanceRecords.courseId, courseId));
  }

  if (attendanceDate) {
    conditions.push(
      eq(attendanceRecords.attendanceDate, attendanceDate),
    );
  }

  const records = await db
    .select({
      id: attendanceRecords.id,
      courseId: attendanceRecords.courseId,
      courseTitle: courses.title,
      userId: attendanceRecords.userId,
      studentEmail: users.email,
      studentName: profiles.fullName,
      attendanceDate: attendanceRecords.attendanceDate,
      status: attendanceRecords.status,
      remarks: attendanceRecords.remarks,
      markedBy: attendanceRecords.markedBy,
      createdAt: attendanceRecords.createdAt,
      updatedAt: attendanceRecords.updatedAt,
    })
    .from(attendanceRecords)
    .innerJoin(
      courses,
      eq(attendanceRecords.courseId, courses.id),
    )
    .innerJoin(
      users,
      eq(attendanceRecords.userId, users.id),
    )
    .leftJoin(
      profiles,
      eq(profiles.userId, users.id),
    )
    .where(
      conditions.length > 0
        ? and(...conditions)
        : undefined,
    )
    .orderBy(
      desc(attendanceRecords.attendanceDate),
      users.email,
    );

  return NextResponse.json({
    records,
  });
}

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

  const result = createAttendanceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid attendance data.",
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
      { error: "Attendance can only be marked for published courses." },
      { status: 400 },
    );
  }

  const student = await db.query.users.findFirst({
    where: eq(users.id, data.userId),
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found." },
      { status: 404 },
    );
  }

  if (student.role !== "student") {
    return NextResponse.json(
      { error: "Attendance can only be recorded for students." },
      { status: 400 },
    );
  }

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, data.userId),
      eq(enrollments.courseId, data.courseId),
      eq(enrollments.status, "active"),
    ),
  });

  if (!enrollment) {
    return NextResponse.json(
      {
        error:
          "The student must have an active enrollment in this course.",
      },
      { status: 400 },
    );
  }

  const existing = await db.query.attendanceRecords.findFirst({
    where: and(
      eq(attendanceRecords.courseId, data.courseId),
      eq(attendanceRecords.userId, data.userId),
      eq(attendanceRecords.attendanceDate, data.attendanceDate),
    ),
  });

  if (existing) {
    return NextResponse.json(
      {
        error:
          "Attendance has already been recorded for this student on this date.",
      },
      { status: 409 },
    );
  }

  try {
    const [record] = await db
      .insert(attendanceRecords)
      .values({
        courseId: data.courseId,
        userId: data.userId,
        attendanceDate: data.attendanceDate,
        status: data.status,
        remarks: data.remarks ?? null,
        markedBy: auth.user.id,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Attendance recorded successfully.",
        record,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "attendance_records_course_user_date_unique",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Attendance has already been recorded for this student on this date.",
        },
        { status: 409 },
      );
    }

    console.error("Attendance creation error:", error);

    return NextResponse.json(
      { error: "Unable to record attendance." },
      { status: 500 },
    );
  }
}
