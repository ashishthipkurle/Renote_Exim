import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
// Note: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be in .env
export const genericRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Stricter rate limit for authentication routes
export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/auth",
});

// Account lockout check (simplified - can be extended with database tracking)
export async function checkAccountLockout(identifier: string) {
  const redis = Redis.fromEnv();
  const lockoutKey = `lockout:${identifier}`;
  const attempts = await redis.get<number>(lockoutKey);
  
  if (attempts && attempts >= 5) {
    return true; // Locked out
  }
  return false;
}

export async function incrementLockoutAttempts(identifier: string) {
  const redis = Redis.fromEnv();
  const lockoutKey = `lockout:${identifier}`;
  const attempts = await redis.incr(lockoutKey);
  
  if (attempts === 1) {
    await redis.expire(lockoutKey, 900); // 15 minutes lockout window
  }
  return attempts;
}
