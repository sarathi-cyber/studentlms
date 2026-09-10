import {
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

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
  }),
);
