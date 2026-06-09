import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

type RateLimitOptions = {
  key: string;
  max: number;
  windowMs: number;
};

// ---------------------------------------------------------------------------
// IP extraction — prefer Vercel's trusted header which clients cannot spoof
// ---------------------------------------------------------------------------
function requestIp(req: NextRequest): string {
  return (
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Upstash path (production)
// ---------------------------------------------------------------------------
function msToUpstashDuration(ms: number): `${number} ${"ms" | "s" | "m" | "h" | "d"}` {
  if (ms < 1_000) return `${ms} ms`;
  if (ms < 60_000) return `${Math.round(ms / 1_000)} s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)} h`;
  return `${Math.round(ms / 86_400_000)} d`;
}

const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(key: string, max: number, windowMs: number): Ratelimit {
  const cacheKey = `${key}:${max}:${windowMs}`;
  if (!limiterCache.has(cacheKey)) {
    limiterCache.set(
      cacheKey,
      new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(max, msToUpstashDuration(windowMs)),
        prefix: `emudb:${key}`,
      })
    );
  }
  return limiterCache.get(cacheKey)!;
}

// ---------------------------------------------------------------------------
// In-memory fallback (development only — not safe for multi-instance deploys)
// ---------------------------------------------------------------------------
type Bucket = { count: number; resetAt: number };
const globalForRateLimit = globalThis as unknown as {
  emudbRateLimitBuckets?: Map<string, Bucket>;
};
const buckets =
  globalForRateLimit.emudbRateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.emudbRateLimitBuckets = buckets;

function inMemoryLimit(req: NextRequest, { key, max, windowMs }: RateLimitOptions): NextResponse | null {
  const now = Date.now();
  const bucketKey = `${key}:${requestIp(req)}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (bucket.count >= max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  bucket.count += 1;
  return null;
}

// ---------------------------------------------------------------------------
// Public API — always async so callers are consistent regardless of backend
// ---------------------------------------------------------------------------
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  if (!hasUpstash) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[rateLimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. " +
          "Rate limiting is disabled. Add Upstash credentials to enable it."
      );
    }
    return inMemoryLimit(req, options);
  }

  const identifier = `${options.key}:${requestIp(req)}`;
  const limiter = getUpstashLimiter(options.key, options.max, options.windowMs);
  const { success, reset } = await limiter.limit(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  return null;
}
