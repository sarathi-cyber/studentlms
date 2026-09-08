import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testConnection() {
  const { sql } = await import("drizzle-orm");
  const { db } = await import("./index");

  try {
    const result = await db.execute(
      sql`SELECT NOW() AS current_time`,
    );

    console.log("✅ PostgreSQL connection successful.");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("❌ PostgreSQL connection failed.");
    console.error(error);
    process.exitCode = 1;
  }
}

testConnection();