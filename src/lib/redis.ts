import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

try {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && !url.includes('placeholder')) {
    redis = new Redis({
      url,
      token,
    });
  } else {
    console.warn('⚠️ [Upstash Redis] Credentials missing or set to placeholder. Rate limiting falls back to bypassed state.');
  }
} catch (e) {
  console.warn('⚠️ [Upstash Redis] Failed to initialize Redis client:', e);
}

export { redis };
