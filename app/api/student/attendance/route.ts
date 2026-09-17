import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  attendanceRecords,
  courses,
} from "@/lib/db/schema";

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

export async function GET() {
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

  const records = await db
    .select({
      id: attendanceRecords.id,
      courseId: attendanceRecords.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      attendanceDate: attendanceRecords.attendanceDate,
      status: attendanceRecords.status,
      remarks: attendanceRecords.remarks,
    })
    .from(attendanceRecords)
    .innerJoin(
      courses,
      eq(attendanceRecords.courseId, courses.id),
    )
    .where(eq(attendanceRecords.userId, user.id))
    .orderBy(
      desc(attendanceRecords.attendanceDate),
    );

  const courseMap = new Map<
    string,
    {
      courseId: string;
      courseTitle: string;
      courseSlug: string;
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
    }
  >();

  for (const record of records) {
    const existing = courseMap.get(record.courseId);

    if (existing) {
      existing.total += 1;

      if (record.status === "present") {
        existing.present += 1;
      } else if (record.status === "absent") {
        existing.absent += 1;
      } else if (record.status === "late") {
        existing.late += 1;
      } else if (record.status === "excused") {
        existing.excused += 1;
      }

      continue;
    }

    courseMap.set(record.courseId, {
      courseId: record.courseId,
      courseTitle: record.courseTitle,
      courseSlug: record.courseSlug,
      total: 1,
      present: record.status === "present" ? 1 : 0,
      absent: record.status === "absent" ? 1 : 0,
      late: record.status === "late" ? 1 : 0,
      excused: record.status === "excused" ? 1 : 0,
    });
  }

  const coursesSummary = Array.from(
    courseMap.values(),
  ).map((summary) => ({
    ...summary,
    attendancePercentage:
      calculateAttendancePercentage(
        summary.present,
        summary.absent,
        summary.late,
      ),
  }));

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

  const overallAttendancePercentage =
    calculateAttendancePercentage(
      present,
      absent,
      late,
    );

  return NextResponse.json({
    summary: {
      total,
      present,
      absent,
      late,
      excused,
      attendancePercentage:
        overallAttendancePercentage,
    },
    courses: coursesSummary,
    records,
  });
}
