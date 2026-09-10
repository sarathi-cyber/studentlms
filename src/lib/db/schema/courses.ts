import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: text("title").notNull(),

    slug: text("slug").notNull().unique(),

    description: text("description"),

    thumbnailUrl: text("thumbnail_url"),

    level: text("level").notNull().default("beginner"),

    durationMinutes: integer("duration_minutes")
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
    levelCheck: check(
      "courses_level_check",
      sql`${table.level} IN ('beginner', 'intermediate', 'advanced')`,
    ),

    durationCheck: check(
      "courses_duration_check",
      sql`${table.durationMinutes} >= 0`,
    ),
  }),
);
