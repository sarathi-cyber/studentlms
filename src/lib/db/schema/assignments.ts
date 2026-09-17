import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { courses } from "./courses";

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description"),
    instructions: text("instructions"),

    maxMarks: integer("max_marks").notNull().default(100),

    dueAt: timestamp("due_at", { withTimezone: true }),

    isPublished: boolean("is_published")
      .notNull()
      .default(false),

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
    courseIdIdx: index("assignments_course_id_idx").on(
      table.courseId,
    ),

    maxMarksCheck: check(
      "assignments_max_marks_check",
      sql`${table.maxMarks} > 0`,
    ),
  }),
);
