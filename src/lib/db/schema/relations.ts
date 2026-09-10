import { relations } from "drizzle-orm";

import { users } from "./users";
import { courses } from "./courses";
import { courseModules } from "./course-modules";
import { lessons } from "./lessons";
import { enrollments } from "./enrollments";
import { lessonProgress } from "./lesson-progress";

export const usersRelations = relations(
  users,
  ({ many }) => ({
    enrollments: many(enrollments),
    lessonProgress: many(lessonProgress),
  }),
);

export const coursesRelations = relations(
  courses,
  ({ many }) => ({
    modules: many(courseModules),
    enrollments: many(enrollments),
  }),
);

export const courseModulesRelations = relations(
  courseModules,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseModules.courseId],
      references: [courses.id],
    }),

    lessons: many(lessons),
  }),
);

export const lessonsRelations = relations(
  lessons,
  ({ one, many }) => ({
    module: one(courseModules, {
      fields: [lessons.moduleId],
      references: [courseModules.id],
    }),

    progress: many(lessonProgress),
  }),
);

export const enrollmentsRelations = relations(
  enrollments,
  ({ one }) => ({
    user: one(users, {
      fields: [enrollments.userId],
      references: [users.id],
    }),

    course: one(courses, {
      fields: [enrollments.courseId],
      references: [courses.id],
    }),
  }),
);

export const lessonProgressRelations = relations(
  lessonProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [lessonProgress.userId],
      references: [users.id],
    }),

    lesson: one(lessons, {
      fields: [lessonProgress.lessonId],
      references: [lessons.id],
    }),
  }),
);
