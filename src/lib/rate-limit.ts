// Fixed-window limiter: 5 posts per IP per 10 minutes. In-memory per server
// instance, which is enough with Turnstile in front; swap for Upstash/Redis if
// abuse shows up across instances.
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 5
const hits = new Map<string, { n: number; reset: number }>()

export function rateLimit(key: string, now = Date.now()) {
  const h = hits.get(key)
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + WINDOW_MS })
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
    return { ok: true, remaining: LIMIT - 1 }
  }
  h.n++
  return { ok: h.n <= LIMIT, remaining: Math.max(0, LIMIT - h.n) }
}
