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

import { courseModules } from "./course-modules";

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    moduleId: uuid("module_id")
      .notNull()
      .references(() => courseModules.id, {
        onDelete: "cascade",
      }),

    title: text("title").notNull(),

    slug: text("slug").notNull(),

    content: text("content"),

    videoUrl: text("video_url"),

    durationMinutes: integer("duration_minutes")
      .notNull()
      .default(0),

    position: integer("position")
      .notNull()
      .default(0),

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
    moduleIdIdx: index(
      "lessons_module_id_idx",
    ).on(table.moduleId),

    positionCheck: check(
      "lessons_position_check",
      sql`${table.position} >= 0`,
    ),

    durationCheck: check(
      "lessons_duration_check",
      sql`${table.durationMinutes} >= 0`,
    ),
  }),
);
