import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");
  const { users } = await import("../src/lib/db/schema");
  const { hashPassword } = await import("../src/lib/auth/password");

  const ADMIN_EMAIL = "admin@techvoraacademy.in";
  const ADMIN_PASSWORD = "Techvora@2026";

  const existing = await db.query.users.findFirst({
    where: eq(users.email, ADMIN_EMAIL),
  });

  if (existing) {
    await db
      .update(users)
      .set({
        role: "admin",
        status: "active",
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.email, ADMIN_EMAIL));

    console.log("✅ Admin account updated.");
    return;
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  await db.insert(users).values({
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    status: "active",
    emailVerified: new Date(),
  });

  console.log("✅ Admin account created.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed to create admin:", error);
    process.exit(1);
  });
