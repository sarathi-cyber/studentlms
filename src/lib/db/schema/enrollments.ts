import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

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
      .default("active"),

    enrolledAt: timestamp("enrolled_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),
  },
  (table) => ({
    userCourseUnique: unique(
      "enrollments_user_course_unique",
    ).on(table.userId, table.courseId),
  }),
);
