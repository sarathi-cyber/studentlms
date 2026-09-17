import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { attendanceRecords } from "@/lib/db/schema";
import { updateAttendanceSchema } from "@/lib/validation/attendance";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const { id } = await context.params;

  const idResult = z.string().uuid().safeParse(id);

  if (!idResult.success) {
    return NextResponse.json(
      { error: "Invalid attendance ID." },
      { status: 400 },
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

  const result = updateAttendanceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid attendance data.",
        details: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existing = await db.query.attendanceRecords.findFirst({
    where: eq(attendanceRecords.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Attendance record not found." },
      { status: 404 },
    );
  }

  if (
    result.data.status === undefined &&
    result.data.remarks === undefined
  ) {
    return NextResponse.json(
      { error: "No attendance fields were provided for update." },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(attendanceRecords)
    .set({
      ...(result.data.status !== undefined
        ? { status: result.data.status }
        : {}),
      ...(result.data.remarks !== undefined
        ? { remarks: result.data.remarks ?? null }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(attendanceRecords.id, id))
    .returning();

  return NextResponse.json({
    message: "Attendance updated successfully.",
    record: updated,
  });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const { id } = await context.params;

  const idResult = z.string().uuid().safeParse(id);

  if (!idResult.success) {
    return NextResponse.json(
      { error: "Invalid attendance ID." },
      { status: 400 },
    );
  }

  const existing = await db.query.attendanceRecords.findFirst({
    where: eq(attendanceRecords.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Attendance record not found." },
      { status: 404 },
    );
  }

  await db
    .delete(attendanceRecords)
    .where(eq(attendanceRecords.id, id));

  return NextResponse.json({
    message: "Attendance record deleted successfully.",
  });
}
