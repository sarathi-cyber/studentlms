export type VerificationEmailData = {
  email: string;
  fullName: string | null;
  verificationUrl: string;
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