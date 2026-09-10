import { z } from "zod";

export const createCourseModuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Module title is required.")
    .max(200, "Module title must not exceed 200 characters."),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Module description must not exceed 5000 characters.",
    )
    .optional()
    .nullable(),

  position: z
    .number()
    .int()
    .min(0, "Module position cannot be negative.")
    .max(100000)
    .default(0),
});

export const updateCourseModuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Module title is required.")
    .max(200, "Module title must not exceed 200 characters.")
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "Module description must not exceed 5000 characters.",
    )
    .nullable()
    .optional(),

  position: z
    .number()
    .int()
    .min(0, "Module position cannot be negative.")
    .max(100000)
    .optional(),
});

export type CreateCourseModuleInput = z.infer<
  typeof createCourseModuleSchema
>;

export type UpdateCourseModuleInput = z.infer<
  typeof updateCourseModuleSchema
>;
