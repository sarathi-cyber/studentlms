type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export function rateLimit(
  key: string,
  options: RateLimitOptions,
) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const entry = {
      count: 1,
      resetAt: now + options.windowMs,
    };

    store.set(key, entry);

    return {
      success: true,
      remaining: options.limit - 1,
      resetAt: entry.resetAt,
    };
  }

  if (existing.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;

  return {
    success: true,
    remaining: Math.max(
      0,
      options.limit - existing.count,
    ),
    resetAt: existing.resetAt,
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