import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { courses } from "./courses";

export const courseModules = pgTable("course_modules", {
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
});
