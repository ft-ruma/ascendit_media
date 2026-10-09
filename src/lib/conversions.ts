import 'server-only'
import { createHash } from 'node:crypto'

const sha = (v: string) => createHash('sha256').update(v.trim().toLowerCase()).digest('hex')

/**
 * Server-side conversion for ads. Meta CAPI is sent directly. Google Ads gets
 * the gclid in the n8n payload, where the offline-conversion upload runs with
 * the account's OAuth credentials (no Google secrets in the web app).
 */
export async function sendConversion(opts: {
  eventId: string
  email?: string
  phone?: string
  ip?: string | null
  userAgent?: string | null
  url: string
  fbclid?: string
  value?: number
  currency?: string
}) {
  const pixel = process.env.META_PIXEL_ID
  const token = process.env.META_CAPI_TOKEN
  if (!pixel || !token) return
  const fbc = opts.fbclid ? `fb.1.${Date.now()}.${opts.fbclid}` : undefined
  try {
    await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_id: opts.eventId,
            action_source: 'website',
            event_source_url: opts.url,
            user_data: {
              em: opts.email ? [sha(opts.email)] : undefined,
              ph: opts.phone ? [sha(opts.phone.replace(/[^0-9]/g, ''))] : undefined,
              client_ip_address: opts.ip ?? undefined,
              client_user_agent: opts.userAgent ?? undefined,
              fbc,
            },
            custom_data: opts.value ? { value: opts.value, currency: opts.currency } : undefined,
          },
        ],
      }),
      signal: AbortSignal.timeout(4000),
    })
  } catch (err) {
    console.error('[conversions] meta', err)
  }
}
