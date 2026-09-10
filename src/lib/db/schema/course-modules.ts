import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { courses } from "./courses";

export const courseModules = pgTable(
  "course_modules",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, {
        onDelete: "cascade",
      }),

    title: text("title").notNull(),

    description: text("description"),

    position: integer("position")
      .notNull()
      .default(0),

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
      "course_modules_course_id_idx",
    ).on(table.courseId),

    positionCheck: check(
      "course_modules_position_check",
      sql`${table.position} >= 0`,
    ),
  }),
);
