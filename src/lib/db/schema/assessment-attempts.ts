import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { assessments } from "./assessments";
import { users } from "./users";

export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    attemptNumber: integer("attempt_number")
      .notNull()
      .default(1),

    startedAt: timestamp("started_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
    }),

    score: integer("score")
      .notNull()
      .default(0),

    percentage: integer("percentage")
      .notNull()
      .default(0),

    passed: boolean("passed")
      .notNull()
      .default(false),
  },
  (table) => ({
    assessmentIdIdx: index(
      "assessment_attempts_assessment_id_idx",
    ).on(table.assessmentId),

    userIdIdx: index(
      "assessment_attempts_user_id_idx",
    ).on(table.userId),

    attemptNumberCheck: check(
      "assessment_attempts_number_check",
      sql`${table.attemptNumber} > 0`,
    ),

    scoreCheck: check(
      "assessment_attempts_score_check",
      sql`${table.score} >= 0`,
    ),

    percentageCheck: check(
      "assessment_attempts_percentage_check",
      sql`${table.percentage} >= 0 AND ${table.percentage} <= 100`,
    ),
  }),
);
