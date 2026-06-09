import { NextRequest, NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  max: number;
  windowMs: number;
};

const globalForRateLimit = globalThis as unknown as {
  emudbRateLimitBuckets?: Map<string, Bucket>;
};

const buckets = globalForRateLimit.emudbRateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.emudbRateLimitBuckets = buckets;

function requestIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimit(req: NextRequest, { key, max, windowMs }: RateLimitOptions) {
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
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  bucket.count += 1;
  return null;
}
