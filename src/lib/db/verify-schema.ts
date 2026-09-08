import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

async function verifySchema() {
  const { sql } = await import("drizzle-orm");
  const { db } = await import("./index");

  try {
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'users',
          'profiles',
          'sessions',
          'password_reset_tokens',
          'email_verification_tokens'
        )
      ORDER BY table_name;
    `);

    console.log("✅ Database schema verification completed.");
    console.log("Tables found:");

    for (const row of result.rows) {
      console.log(`   ✓ ${row.table_name}`);
    }

    const expectedTables = [
      "users",
      "profiles",
      "sessions",
      "password_reset_tokens",
      "email_verification_tokens",
    ];

    const foundTables = result.rows.map(
      (row) => row.table_name,
    );

    const missingTables = expectedTables.filter(
      (table) => !foundTables.includes(table),
    );

    if (missingTables.length > 0) {
      console.error("\n❌ Missing tables:");
      missingTables.forEach((table) => {
        console.error(`   ✗ ${table}`);
      });

      process.exitCode = 1;
      return;
    }

    console.log("\n🎉 All Phase 1 authentication tables exist.");
  } catch (error) {
    console.error("❌ Schema verification failed.");
    console.error(error);

    process.exitCode = 1;
  }
}

verifySchema();