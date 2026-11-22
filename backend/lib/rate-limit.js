import { AppError } from "./errors.js";
// In-memory sliding window. Fine for a single instance; on Vercel (serverless) swap for Upstash/Redis – see README.
const buckets = globalThis._cnRate || (globalThis._cnRate = new Map());
export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) { buckets.set(key, hits); throw new AppError(429, "Too many attempts. Please wait a moment and try again.", "RATE_LIMITED"); }
  hits.push(now); buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
}
