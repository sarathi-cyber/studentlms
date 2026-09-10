export type VerificationEmailData = {
  email: string;
  fullName: string | null;
  verificationUrl: string;
};

export type PasswordResetEmailData = {
  email: string;
  resetUrl: string;
};

export async function sendVerificationEmail(
  data: VerificationEmailData,
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log("\n========================================");
    console.log("📧 DEVELOPMENT VERIFICATION EMAIL");
    console.log("========================================");
    console.log(`To: ${data.email}`);
    console.log(`Name: ${data.fullName ?? "Student"}`);
    console.log(`Verification URL: ${data.verificationUrl}`);
    console.log("========================================\n");

    return;
  }

  throw new Error(
    "Production email provider is not configured.",
  );
}

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log("\n========================================");
    console.log("🔐 DEVELOPMENT PASSWORD RESET EMAIL");
    console.log("========================================");
    console.log(`To: ${data.email}`);
    console.log(`Password Reset URL: ${data.resetUrl}`);
    console.log("========================================\n");

    return;
  }

  throw new Error(
    "Production email provider is not configured.",
  );
}
