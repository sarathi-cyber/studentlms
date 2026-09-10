import { z } from "zod";

const lessonSlugSchema = z
  .string()
  .trim()
  .min(1, "Lesson slug is required.")
  .max(120, "Lesson slug must not exceed 120 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Lesson slug may contain only lowercase letters, numbers, and hyphens.",
  );

export const createLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Lesson title is required.")
    .max(200, "Lesson title must not exceed 200 characters."),

  slug: lessonSlugSchema,

  content: z
    .string()
    .max(50000, "Lesson content must not exceed 50000 characters.")
    .optional()
    .nullable(),

  videoUrl: z
    .string()
    .trim()
    .url("Video URL must be valid.")
    .max(2048)
    .optional()
    .nullable(),

  durationMinutes: z
    .number()
    .int()
    .min(0, "Lesson duration cannot be negative.")
    .max(100000)
    .default(0),

  position: z
    .number()
    .int()
    .min(0, "Lesson position cannot be negative.")
    .max(100000)
    .default(0),

  isPublished: z.boolean().default(false),
});

export const updateLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Lesson title is required.")
    .max(200, "Lesson title must not exceed 200 characters.")
    .optional(),

  slug: lessonSlugSchema.optional(),

  content: z
    .string()
    .max(50000, "Lesson content must not exceed 50000 characters.")
    .nullable()
    .optional(),

  videoUrl: z
    .string()
    .trim()
    .url("Video URL must be valid.")
    .max(2048)
    .nullable()
    .optional(),

  durationMinutes: z
    .number()
    .int()
    .min(0, "Lesson duration cannot be negative.")
    .max(100000)
    .optional(),

  position: z
    .number()
    .int()
    .min(0, "Lesson position cannot be negative.")
    .max(100000)
    .optional(),

  isPublished: z.boolean().optional(),
});

export type CreateLessonInput = z.infer<
  typeof createLessonSchema
>;

export type UpdateLessonInput = z.infer<
  typeof updateLessonSchema
>;
