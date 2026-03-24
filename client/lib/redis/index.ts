import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client
export const redisUrl = process.env.UPSTASH_REDIS_REST_URL || 'https://dummy.upstash.io';
export const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy';

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

// Configure Rate Limiters based on V3.0 Spec
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
});

export const orderRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

export const documentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
});

export const searchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

export const defaultRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '1 m'),
  analytics: true,
});
