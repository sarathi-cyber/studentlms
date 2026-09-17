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

export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, {
        onDelete: "cascade",
      }),

    title: text("title").notNull(),

    description: text("description"),

    instructions: text("instructions"),

    durationMinutes: integer("duration_minutes")
      .notNull()
      .default(0),

    passPercentage: integer("pass_percentage")
      .notNull()
      .default(50),

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
    courseIdIdx: index(
      "assessments_course_id_idx",
    ).on(table.courseId),

    durationCheck: check(
      "assessments_duration_check",
      sql`${table.durationMinutes} >= 0`,
    ),

    passPercentageCheck: check(
      "assessments_pass_percentage_check",
      sql`${table.passPercentage} >= 0 AND ${table.passPercentage} <= 100`,
    ),
  }),
);
