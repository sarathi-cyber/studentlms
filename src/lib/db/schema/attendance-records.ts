import {
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { courses } from "./courses";
import { users } from "./users";

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    attendanceDate: date("attendance_date").notNull(),

    status: text("status").notNull().default("present"),

    remarks: text("remarks"),

    markedBy: uuid("marked_by").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    courseUserDateUnique: uniqueIndex(
      "attendance_records_course_user_date_unique",
    ).on(table.courseId, table.userId, table.attendanceDate),

    courseIdIdx: index("attendance_records_course_id_idx").on(
      table.courseId,
    ),

    userIdIdx: index("attendance_records_user_id_idx").on(table.userId),

    attendanceDateIdx: index("attendance_records_date_idx").on(
      table.attendanceDate,
    ),

    statusCheck: check(
      "attendance_records_status_check",
      sql`${table.status} IN ('present', 'absent', 'late', 'excused')`,
    ),
  }),
);
