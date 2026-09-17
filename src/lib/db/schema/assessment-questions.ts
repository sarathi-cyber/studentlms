import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { assessments } from "./assessments";

export const assessmentQuestions = pgTable(
  "assessment_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, {
        onDelete: "cascade",
      }),

    questionText: text("question_text").notNull(),

    questionType: text("question_type")
      .notNull()
      .default("mcq"),

    marks: integer("marks")
      .notNull()
      .default(1),

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
    assessmentIdIdx: index(
      "assessment_questions_assessment_id_idx",
    ).on(table.assessmentId),

    positionCheck: check(
      "assessment_questions_position_check",
      sql`${table.position} >= 0`,
    ),

    marksCheck: check(
      "assessment_questions_marks_check",
      sql`${table.marks} > 0`,
    ),

    questionTypeCheck: check(
      "assessment_questions_type_check",
      sql`${table.questionType} IN ('mcq')`,
    ),
  }),
);
