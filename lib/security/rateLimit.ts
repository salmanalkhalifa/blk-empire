// lib/security/rateLimit.ts

type RateLimitEntry = {
  lastRequest: number;
};

const rateLimitMap: Map<string, RateLimitEntry> = new Map();

// Cleanup interval (prevents memory leak)
setInterval(() => {
  const now = Date.now();
  const EXPIRY = 60 * 1000; // 1 minute

  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.lastRequest > EXPIRY) {
      rateLimitMap.delete(key);
    }
  }
}, 30000); // run every 30s

/**
 * Generic rate limiter
 */
export function rateLimit(key: string, limitMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    rateLimitMap.set(key, { lastRequest: now });
    return true;
  }

  if (now - entry.lastRequest < limitMs) {
    return false;
  }

  entry.lastRequest = now;
  return true;
}

/**
 * Cum event specific limiter
 * Rule: max 1 event per 5 seconds per provider-recipient pair
 */
export function rateLimitCumEvent(providerId: string, recipientId: string): boolean {
  const key = `cum:${providerId}:${recipientId}`;
  return rateLimit(key, 5000); // 5 seconds
}