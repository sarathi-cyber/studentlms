import {
  integer,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { assessmentAttempts } from "./assessment-attempts";
import { assessmentQuestions } from "./assessment-questions";
import { assessmentOptions } from "./assessment-options";

export const assessmentAnswers = pgTable(
  "assessment_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => assessmentAttempts.id, {
        onDelete: "cascade",
      }),

    questionId: uuid("question_id")
      .notNull()
      .references(() => assessmentQuestions.id, {
        onDelete: "cascade",
      }),

    selectedOptionId: uuid("selected_option_id")
      .references(() => assessmentOptions.id, {
        onDelete: "set null",
      }),

    awardedMarks: integer("awarded_marks")
      .notNull()
      .default(0),

    answeredAt: timestamp("answered_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
);
