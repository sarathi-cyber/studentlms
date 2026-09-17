import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable();

export const updateProfileSchema = z.object({
  fullName: optionalText(120),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD")
    .optional()
    .nullable(),
  educationLevel: optionalText(100),
  classOrYear: optionalText(100),
  institution: optionalText(200),
  schoolOrCollege: optionalText(200),
  phone: optionalText(30),
  country: optionalText(100),
  parentGuardianName: optionalText(120),
  parentGuardianContact: optionalText(30),
  parentConsent: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
