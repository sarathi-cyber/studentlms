import { z } from "zod";

export const createEnrollmentSchema = z.object({
  courseId: z.string().uuid(),
});

export const updateEnrollmentStatusSchema = z.discriminatedUnion(
  "status",
  [
    z.object({
      status: z.literal("active"),
    }),

    z.object({
      status: z.literal("cancelled"),
      terminationReason: z
        .string()
        .trim()
        .min(5, "Termination reason must be at least 5 characters.")
        .max(
          1000,
          "Termination reason must not exceed 1000 characters.",
        ),
    }),
  ],
);
