import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./users";
import { courses } from "./courses";

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, {
        onDelete: "cascade",
      }),

    status: text("status")
      .notNull()
      .default("pending"),

    enrolledAt: timestamp("enrolled_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    approvedAt: timestamp("approved_at", {
      withTimezone: true,
    }),

    approvedBy: uuid("approved_by").references(() => users.id, {
      onDelete: "set null",
    }),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),

    expiredAt: timestamp("expired_at", {
      withTimezone: true,
    }),

    cancelledAt: timestamp("cancelled_at", {
      withTimezone: true,
    }),

    terminationReason: text("termination_reason"),

    reEnrollmentRequestedAt: timestamp("re_enrollment_requested_at", {
      withTimezone: true,
    }),
  },
  (table) => ({
    activeEnrollmentUnique: uniqueIndex(
      "enrollments_active_user_course_unique",
    )
      .on(table.userId, table.courseId)
      .where(
        sql`${table.status} IN ('pending', 'active')`,
      ),

    userIdIdx: index(
      "enrollments_user_id_idx",
    ).on(table.userId),

    courseIdIdx: index(
      "enrollments_course_id_idx",
    ).on(table.courseId),

    statusIdx: index(
      "enrollments_status_idx",
    ).on(table.status),

    approvedByIdx: index(
      "enrollments_approved_by_idx",
    ).on(table.approvedBy),

    statusCheck: check(
      "enrollments_status_check",
      sql`${table.status} IN ('pending', 'active', 'completed', 'expired', 'cancelled')`,
    ),
  }),
);
