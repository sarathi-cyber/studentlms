import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  attendanceRecords,
  courses,
  enrollments,
} from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

function calculateAttendancePercentage(
  present: number,
  absent: number,
  late: number,
) {
  const counted = present + absent + late;

  if (counted === 0) {
    return 0;
  }

  return Number(
    (((present + late) / counted) * 100).toFixed(2),
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  if (user.role !== "student") {
    return NextResponse.json(
      { error: "Forbidden." },
      { status: 403 },
    );
  }

  const { courseId } = await context.params;

  const courseIdResult = z.string().uuid().safeParse(courseId);

  if (!courseIdResult.success) {
    return NextResponse.json(
      { error: "Invalid course ID." },
      { status: 400 },
    );
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found." },
      { status: 404 },
    );
  }

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, user.id),
      eq(enrollments.courseId, courseId),
    ),
    orderBy: (table, { desc }) => [
      desc(table.enrolledAt),
    ],
  });

  if (!enrollment) {
    return NextResponse.json(
      {
        error: "You are not enrolled in this course.",
      },
      { status: 403 },
    );
  }

  const records = await db
    .select({
      id: attendanceRecords.id,
      attendanceDate: attendanceRecords.attendanceDate,
      status: attendanceRecords.status,
      remarks: attendanceRecords.remarks,
    })
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.courseId, courseId),
        eq(attendanceRecords.userId, user.id),
      ),
    )
    .orderBy(
      asc(attendanceRecords.attendanceDate),
    );

  const total = records.length;

  const present = records.filter(
    (record) => record.status === "present",
  ).length;

  const absent = records.filter(
    (record) => record.status === "absent",
  ).length;

  const late = records.filter(
    (record) => record.status === "late",
  ).length;

  const excused = records.filter(
    (record) => record.status === "excused",
  ).length;

  const attendancePercentage =
    calculateAttendancePercentage(
      present,
      absent,
      late,
    );

  return NextResponse.json({
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
    },
    summary: {
      total,
      present,
      absent,
      late,
      excused,
      attendancePercentage,
    },
    records,
  });
}
