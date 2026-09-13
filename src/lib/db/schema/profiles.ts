import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  fullName: text("full_name"),

  profileImage: text("profile_image"),

  phone: text("phone"),

  dateOfBirth: date("date_of_birth"),

  educationLevel: text("education_level"),

  classOrYear: text("class_or_year"),

  institution: text("institution"),

  schoolOrCollege: text("school_or_college"),

  parentGuardianName: text("parent_guardian_name"),

  parentGuardianContact: text("parent_guardian_contact"),

  parentConsent: boolean("parent_consent")
    .notNull()
    .default(false),

  profileCompleted: boolean("profile_completed")
    .notNull()
    .default(false),

  country: text("country"),

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
});
