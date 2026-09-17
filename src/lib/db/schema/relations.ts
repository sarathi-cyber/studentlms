import { relations } from "drizzle-orm";

import { users } from "./users";
import { courses } from "./courses";
import { courseModules } from "./course-modules";
import { lessons } from "./lessons";
import { enrollments } from "./enrollments";
import { lessonProgress } from "./lesson-progress";
import { assessments } from "./assessments";
import { assessmentQuestions } from "./assessment-questions";
import { assessmentOptions } from "./assessment-options";
import { assessmentAttempts } from "./assessment-attempts";
import { assessmentAnswers } from "./assessment-answers";
import { assignments } from "./assignments";
import { assignmentSubmissions } from "./assignment-submissions";

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  lessonProgress: many(lessonProgress),
  assessmentAttempts: many(assessmentAttempts),
  assignmentSubmissions: many(assignmentSubmissions, {
    relationName: "student",
  }),
  gradedAssignmentSubmissions: many(assignmentSubmissions, {
    relationName: "grader",
  }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(courseModules),
  enrollments: many(enrollments),
  assessments: many(assessments),
  assignments: many(assignments),
}));

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

export const assessmentsRelations = relations(
  assessments,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [assessments.courseId],
      references: [courses.id],
    }),
    questions: many(assessmentQuestions),
    attempts: many(assessmentAttempts),
  }),
);

export const assessmentQuestionsRelations = relations(
  assessmentQuestions,
  ({ one, many }) => ({
    assessment: one(assessments, {
      fields: [assessmentQuestions.assessmentId],
      references: [assessments.id],
    }),
    options: many(assessmentOptions),
    answers: many(assessmentAnswers),
  }),
);

export const assessmentOptionsRelations = relations(
  assessmentOptions,
  ({ one, many }) => ({
    question: one(assessmentQuestions, {
      fields: [assessmentOptions.questionId],
      references: [assessmentQuestions.id],
    }),
    answers: many(assessmentAnswers),
  }),
);

export const assessmentAttemptsRelations = relations(
  assessmentAttempts,
  ({ one, many }) => ({
    assessment: one(assessments, {
      fields: [assessmentAttempts.assessmentId],
      references: [assessments.id],
    }),
    user: one(users, {
      fields: [assessmentAttempts.userId],
      references: [users.id],
    }),
    answers: many(assessmentAnswers),
  }),
);

export const assessmentAnswersRelations = relations(
  assessmentAnswers,
  ({ one }) => ({
    attempt: one(assessmentAttempts, {
      fields: [assessmentAnswers.attemptId],
      references: [assessmentAttempts.id],
    }),
    question: one(assessmentQuestions, {
      fields: [assessmentAnswers.questionId],
      references: [assessmentQuestions.id],
    }),
    selectedOption: one(assessmentOptions, {
      fields: [assessmentAnswers.selectedOptionId],
      references: [assessmentOptions.id],
    }),
  }),
);

export const assignmentsRelations = relations(
  assignments,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [assignments.courseId],
      references: [courses.id],
    }),
    submissions: many(assignmentSubmissions),
  }),
);

export const assignmentSubmissionsRelations = relations(
  assignmentSubmissions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentSubmissions.assignmentId],
      references: [assignments.id],
    }),
    student: one(users, {
      fields: [assignmentSubmissions.userId],
      references: [users.id],
      relationName: "student",
    }),
    grader: one(users, {
      fields: [assignmentSubmissions.gradedBy],
      references: [users.id],
      relationName: "grader",
    }),
  }),
);
