import 'server-only'
import type { LeadInput } from '@/builder/lead-schema'
import { sign } from './sign'

export async function forwardToN8n(payload: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = process.env.N8N_LEAD_WEBHOOK
  if (!url) return { ok: false, error: 'N8N_LEAD_WEBHOOK not set' }
  const body = JSON.stringify(payload)
  const signature = sign(body, process.env.N8N_SHARED_SECRET ?? '')
  let error = 'unknown'
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-ascendit-signature': signature },
        body,
        signal: AbortSignal.timeout(6000),
      })
      if (res.ok) return { ok: true }
      error = `HTTP ${res.status}`
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
  }
  return { ok: false, error }
}

export async function writeOutbox(ref: string, lead: LeadInput, payload: unknown, error: string) {
  if (!process.env.DATABASE_URI) {
    console.error(`[lead] ${ref} not delivered (${error}) and no database for the outbox:`, JSON.stringify(payload))
    return
  }
  try {
    const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
    const payloadClient = await getPayload({ config })
    await payloadClient.create({
      collection: 'lead_outbox',
      overrideAccess: true,
      data: { reference: ref, type: lead.type, payload: payload as Record<string, unknown>, attempts: 3, lastError: error, delivered: false },
    })
  } catch (err) {
    console.error(`[lead] ${ref} outbox write failed`, err, JSON.stringify(payload))
  }
}
