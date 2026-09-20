import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const adminPermissions = pgTable(
  "admin_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    manageStudents: boolean("manage_students").notNull().default(false),
    manageCourses: boolean("manage_courses").notNull().default(false),
    manageLessons: boolean("manage_lessons").notNull().default(false),
    manageAssignments: boolean("manage_assignments").notNull().default(false),
    manageAssessments: boolean("manage_assessments").notNull().default(false),
    manageAttendance: boolean("manage_attendance").notNull().default(false),
    manageSupport: boolean("manage_support").notNull().default(false),
    manageCertificates: boolean("manage_certificates").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("admin_permissions_user_id_idx").on(table.userId),
  }),
);
