import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter",
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter",
  )
  .regex(
    /[0-9]/,
    "Password must contain at least one number",
  )
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),

  password: passwordSchema,

  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(100, "Full name is too long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, "Reset token is required"),

  password: passwordSchema,
});