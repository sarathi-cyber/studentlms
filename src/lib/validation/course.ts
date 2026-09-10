import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters.")
  .max(120, "Slug must not exceed 120 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug may contain only lowercase letters, numbers, and hyphens.",
  );

const levelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Course title must be at least 3 characters.")
    .max(200, "Course title must not exceed 200 characters."),

  slug: slugSchema,

  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters.")
    .optional()
    .nullable(),

  thumbnailUrl: z
    .string()
    .trim()
    .url("Thumbnail URL must be valid.")
    .max(2048)
    .optional()
    .nullable(),

  level: levelSchema.default("beginner"),

  durationMinutes: z
    .number()
    .int()
    .min(0)
    .max(100000)
    .default(0),

  isPublished: z.boolean().default(false),
});

/**
 * PATCH schema intentionally has NO defaults.
 * Only fields supplied by the client are updated.
 */
export const updateCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Course title must be at least 3 characters.")
    .max(200, "Course title must not exceed 200 characters.")
    .optional(),

  slug: slugSchema.optional(),

  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters.")
    .nullable()
    .optional(),

  thumbnailUrl: z
    .string()
    .trim()
    .url("Thumbnail URL must be valid.")
    .max(2048)
    .nullable()
    .optional(),

  level: levelSchema.optional(),

  durationMinutes: z
    .number()
    .int()
    .min(0)
    .max(100000)
    .optional(),

  isPublished: z.boolean().optional(),
});

export type CreateCourseInput = z.infer<
  typeof createCourseSchema
>;

export type UpdateCourseInput = z.infer<
  typeof updateCourseSchema
>;
