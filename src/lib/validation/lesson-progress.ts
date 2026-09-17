import { z } from "zod";

export const updateLessonProgressSchema = z.object({
  progressPercent: z
    .number()
    .int()
    .min(0, "Progress cannot be below 0.")
    .max(100, "Progress cannot exceed 100."),
});
