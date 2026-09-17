import { z } from "zod";

export const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "excused",
]);

export const createAttendanceSchema = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
  attendanceDate: z.string().date(),
  status: attendanceStatusSchema,
  remarks: z.string().trim().max(1000).nullable().optional(),
});

export const updateAttendanceSchema = z.object({
  status: attendanceStatusSchema.optional(),
  remarks: z.string().trim().max(1000).nullable().optional(),
});

export const bulkAttendanceRecordSchema = z.object({
  userId: z.string().uuid(),
  status: attendanceStatusSchema,
  remarks: z.string().trim().max(1000).nullable().optional(),
});

export const bulkAttendanceSchema = z.object({
  courseId: z.string().uuid(),
  attendanceDate: z.string().date(),
  records: z
    .array(bulkAttendanceRecordSchema)
    .min(1)
    .max(1000),
});
