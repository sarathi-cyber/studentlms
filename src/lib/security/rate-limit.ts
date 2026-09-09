import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

export async function rateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + options.windowMs;

  const result = await db.execute(sql`
    INSERT INTO rate_limit_entries (
      key,
      count,
      reset_at,
      created_at,
      updated_at
    )
    VALUES (
      ${key},
      1,
      to_timestamp(${resetAt} / 1000.0),
      NOW(),
      NOW()
    )
    ON CONFLICT (key)
    DO UPDATE SET
      count = CASE
        WHEN rate_limit_entries.reset_at <= NOW()
          THEN 1
        ELSE rate_limit_entries.count + 1
      END,
      reset_at = CASE
        WHEN rate_limit_entries.reset_at <= NOW()
          THEN to_timestamp(${resetAt} / 1000.0)
        ELSE rate_limit_entries.reset_at
      END,
      updated_at = NOW()
    RETURNING
      count,
      EXTRACT(
        EPOCH FROM reset_at
      ) * 1000 AS reset_at_ms
  `);

  const row = result.rows[0] as {
    count: number;
    reset_at_ms: number;
  };

  const count = Number(row.count);
  const databaseResetAt = Number(row.reset_at_ms);

  return {
    success: count <= options.limit,
    remaining: Math.max(
      0,
      options.limit - count,
    ),
    resetAt: databaseResetAt,
  };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get(
    "x-forwarded-for",
  );

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  return (
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
