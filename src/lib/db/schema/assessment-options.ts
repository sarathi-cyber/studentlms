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

import { assessmentQuestions } from "./assessment-questions";

export const assessmentOptions = pgTable(
  "assessment_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    questionId: uuid("question_id")
      .notNull()
      .references(() => assessmentQuestions.id, {
        onDelete: "cascade",
      }),

    optionText: text("option_text").notNull(),

    isCorrect: boolean("is_correct")
      .notNull()
      .default(false),

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
    questionIdIdx: index(
      "assessment_options_question_id_idx",
    ).on(table.questionId),

    positionCheck: check(
      "assessment_options_position_check",
      sql`${table.position} >= 0`,
    ),
  }),
);
