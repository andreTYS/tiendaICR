/**
 * In-memory token-bucket rate limiter per key (e.g. IP).
 * Suitable for single-instance VPS. Swap for Redis adapter when scaling.
 * Decision: 5 attempts / 60s window (open-questions-resolved #5).
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

const MAX_TOKENS = 5;
const REFILL_INTERVAL_MS = 60_000; // 60 seconds

export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
} {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens if window has passed
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    bucket.tokens = MAX_TOKENS;
    bucket.lastRefill = now;
  }

  const resetInMs = REFILL_INTERVAL_MS - (now - bucket.lastRefill);

  if (bucket.tokens <= 0) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  bucket.tokens -= 1;
  return { allowed: true, remaining: bucket.tokens, resetInMs };
}

/** Exposed for testing only */
export function _clearBuckets() {
  buckets.clear();
}
