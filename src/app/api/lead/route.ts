import { randomBytes } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { estimate, isStoreToSystem } from '@/builder/estimate'
import { leadSchema } from '@/builder/lead-schema'
import { budgetBand } from '@/builder/schema'
import { getRateCard } from '@/lib/cms'
import { sendConversion } from '@/lib/conversions'
import { rateLimit } from '@/lib/rate-limit'
import { forwardToN8n, writeOutbox } from '@/lib/lead-delivery'
import { FIRST_TOUCH_COOKIE, parseFirstTouch } from '@/lib/utm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const reference = () => {
  const d = new Date()
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
  return `ASC-${ymd}-${randomBytes(2).toString('hex').toUpperCase()}`
}

export async function POST(req: Request) {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown'

  // 1. Validate with the shared zod schema; reject with field errors.
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = leadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the highlighted fields', fields: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
      { status: 422 },
    )
  }
  const lead = parsed.data
  const ref = reference()

  // 2. Spam checks: honeypot (pretend success), rate limit, Turnstile.
  if (lead.website) return NextResponse.json({ ok: true, reference: ref })
  if (!rateLimit(ip).ok) return NextResponse.json({ ok: false, error: 'Too many submissions, please try again in a few minutes' }, { status: 429 })
  if (lead.status === 'complete' && !(await verifyTurnstile(lead.turnstileToken, ip))) {
    return NextResponse.json({ ok: false, error: 'Spam check failed, please refresh and try again' }, { status: 403 })
  }

  // 3. Re-compute the estimate server-side from the current rate card. Never trust the client's number.
  let est: ReturnType<typeof estimate> | null = null
  let derived: Record<string, unknown> = {}
  if (lead.type === 'builder' && lead.status === 'complete') {
    const card = await getRateCard()
    est = estimate(lead.answers, card, lead.currency)
    const band = budgetBand(lead.answers.budget)
    derived = {
      storeToSystem: isStoreToSystem(lead.answers),
      budgetMax: band?.max === Number.MAX_SAFE_INTEGER ? null : band?.max,
      budgetMin: band?.min,
      budgetCur: band?.id.startsWith('lkr') ? 'LKR' : 'USD',
    }
  }

  // 4. Attach context: first-touch UTM / gclid / fbclid, landing, referrer, country, currency.
  const ft = parseFirstTouch((await cookies()).get(FIRST_TOUCH_COOKIE)?.value)
  const attribution = {
    ...ft,
    page: lead.page,
    source: lead.source,
    country: h.get('x-vercel-ip-country') ?? h.get('x-azure-clientip-country') ?? null,
    currency: lead.currency,
  }

  const payload = {
    reference: ref,
    type: lead.type,
    status: lead.status,
    receivedAt: new Date().toISOString(),
    answers: 'answers' in lead ? lead.answers : undefined,
    product: 'product' in lead ? lead.product : undefined,
    role: 'role' in lead ? lead.role : undefined,
    estimate: est ? { low: est.low, high: est.high, cur: est.cur, saving: est.saving, products: est.products } : undefined,
    derived,
    contact: lead.contact,
    attribution,
  }

  // 5. Signed POST to n8n, retry twice, outbox on failure so nothing is lost.
  const delivered = await forwardToN8n(payload)
  if (!delivered.ok) await writeOutbox(ref, lead, payload, delivered.error)

  // 6. Server-side conversion event for ads (complete leads only).
  if (lead.status === 'complete' && lead.type !== 'career') {
    void sendConversion({
      eventId: ref,
      email: lead.contact.email,
      phone: lead.contact.whatsapp,
      ip,
      userAgent: h.get('user-agent'),
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${lead.page ?? '/'}`,
      fbclid: ft.fbclid,
      value: est?.low,
      currency: est?.cur,
    })
  }

  return NextResponse.json({ ok: true, reference: ref, estimate: payload.estimate })
}

async function verifyTurnstile(token: string | null | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // not configured (local / preview without keys)
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    })
    return ((await res.json()) as { success: boolean }).success
  } catch {
    return false
  }
}
