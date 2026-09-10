import {
  check,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./users";
import { lessons } from "./lessons";

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, {
        onDelete: "cascade",
      }),

    progressPercent: integer("progress_percent")
      .notNull()
      .default(0),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),

    lastAccessedAt: timestamp("last_accessed_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userLessonUnique: unique(
      "lesson_progress_user_lesson_unique",
    ).on(table.userId, table.lessonId),

    userIdIdx: index(
      "lesson_progress_user_id_idx",
    ).on(table.userId),

    lessonIdIdx: index(
      "lesson_progress_lesson_id_idx",
    ).on(table.lessonId),

    progressCheck: check(
      "lesson_progress_percent_check",
      sql`${table.progressPercent} >= 0 AND ${table.progressPercent} <= 100`,
    ),
  }),
);
