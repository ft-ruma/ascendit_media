// First-touch attribution: the middleware writes this cookie once, on the first
// request of a visitor, and /api/lead reads it back.
export const FIRST_TOUCH_COOKIE = 'ft'

export const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const

export type FirstTouch = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>> & {
  landing?: string
  referrer?: string
  ts?: number
}

export function firstTouchFrom(url: URL, referrer: string | null): FirstTouch {
  const ft: FirstTouch = { landing: url.pathname, ts: Date.now() }
  for (const k of ATTRIBUTION_KEYS) {
    const v = url.searchParams.get(k)
    if (v) ft[k] = v.slice(0, 200)
  }
  if (referrer && !referrer.startsWith(url.origin)) ft.referrer = referrer.slice(0, 300)
  return ft
}

export function parseFirstTouch(raw: string | undefined): FirstTouch {
  if (!raw) return {}
  try {
    const v = JSON.parse(raw)
    return v && typeof v === 'object' ? (v as FirstTouch) : {}
  } catch {
    return {}
  }
}
