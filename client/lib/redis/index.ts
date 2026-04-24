import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client
const isDummy = !process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL.includes('dummy.upstash.io');

export const redisUrl = process.env.UPSTASH_REDIS_REST_URL || 'https://dummy.upstash.io';
export const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy';

export const redis = isDummy ? null : new Redis({
  url: redisUrl,
  token: redisToken,
});

// Helper to create a rate limiter that fails open if redis is not available
function createRateLimiter(options: { tokens: number, window: string }) {
  if (isDummy || !redis) {
    return {
      limit: async () => ({ success: true, remaining: 999, reset: 0, limit: 999 }),
    } as any;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.tokens, options.window as any),
    analytics: true,
  });
}

// Configure Rate Limiters based on V3.0 Spec
export const authRateLimit = createRateLimiter({ tokens: 10, window: '1 m' });
export const orderRateLimit = createRateLimiter({ tokens: 5, window: '1 m' });
export const documentRateLimit = createRateLimiter({ tokens: 10, window: '1 h' });
export const searchRateLimit = createRateLimiter({ tokens: 100, window: '1 m' });
export const defaultRateLimit = createRateLimiter({ tokens: 200, window: '1 m' });

