import { z } from "zod";

const baseAssessmentSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(5000).optional(),
  instructions: z.string().trim().max(10000).optional(),
  durationMinutes: z.number().int().min(0).max(1440),
  passPercentage: z.number().int().min(0).max(100),
  isPublished: z.boolean(),
});

export const createAssessmentSchema = baseAssessmentSchema.extend({
  courseId: z.string().uuid(),
});

export const updateAssessmentSchema = baseAssessmentSchema.partial();

export const createAssessmentQuestionSchema = z.object({
  questionText: z.string().trim().min(1).max(10000),
  questionType: z.literal("mcq"),
  marks: z.number().int().min(1).max(1000),
  position: z.number().int().min(0),
});

export const updateAssessmentQuestionSchema =
  createAssessmentQuestionSchema.partial();

export const createAssessmentOptionSchema = z.object({
  optionText: z.string().trim().min(1).max(5000),
  isCorrect: z.boolean(),
  position: z.number().int().min(0),
});

export const updateAssessmentOptionSchema =
  createAssessmentOptionSchema.partial();
