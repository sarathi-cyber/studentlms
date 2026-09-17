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

import { assignments } from "./assignments";
import { users } from "./users";

export const assignmentSubmissions = pgTable(
  "assignment_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    submissionUrl: text("submission_url"),
    submissionText: text("submission_text"),

    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
    }),

    marks: integer("marks"),
    feedback: text("feedback"),

    gradedAt: timestamp("graded_at", {
      withTimezone: true,
    }),

    gradedBy: uuid("graded_by").references(() => users.id, {
      onDelete: "set null",
    }),

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
    assignmentIdIdx: index(
      "assignment_submissions_assignment_id_idx",
    ).on(table.assignmentId),

    userIdIdx: index(
      "assignment_submissions_user_id_idx",
    ).on(table.userId),

    marksCheck: check(
      "assignment_submissions_marks_check",
      sql`${table.marks} IS NULL OR ${table.marks} >= 0`,
    ),
  }),
);
