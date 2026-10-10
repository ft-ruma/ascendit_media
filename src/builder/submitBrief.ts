'use client'
import { contactSchema } from './schema'
import type { Draft } from './store'

/** POST a complete brief to /api/lead (unchanged endpoint). Returns the reference or throws with a readable message. */
export async function submitBrief(opts: {
  draft: Draft
  currency: 'LKR' | 'USD'
  source: string
  token: string | null
  honeypot: string
}): Promise<string> {
  const { draft } = opts
  const res = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'builder',
      status: 'complete',
      answers: { what: draft.what, business: draft.business, scope: draft.scope, timeline: draft.timeline, budget: draft.budget },
      contact: contactSchema.parse(draft.contact),
      currency: opts.currency,
      source: opts.source,
      page: location.pathname,
      turnstileToken: opts.token,
      website: opts.honeypot,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) throw new Error(data.error ?? 'Something went wrong')
  return data.reference as string
}
