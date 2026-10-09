import { revalidatePath } from 'next/cache'
import { sign } from './sign'

/** Purge only the affected paths so a publish goes live in seconds. */
export async function revalidate(paths: string[]) {
  for (const path of new Set(paths)) {
    try {
      if (path.includes('[')) revalidatePath(path, 'page')
      else revalidatePath(path)
    } catch {
      // Outside a Next request (seed script, migrations): nothing is cached yet.
    }
  }
}

export const PRICE_PATHS = [
  '/',
  '/services/retail-design',
  '/services/software',
  '/services/web',
  '/services/brand',
  '/products',
  '/products/[slug]',
  '/start',
]

/** Content events (e.g. case-study.published) for n8n to post to socials or Slack. */
export async function notifyN8n(event: string, doc: Record<string, unknown>) {
  const url = process.env.N8N_EVENTS_WEBHOOK
  if (!url) return
  const body = JSON.stringify({ event, doc: { id: doc.id, slug: doc.slug, title: doc.client ?? doc.name } })
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-ascendit-signature': sign(body, process.env.N8N_SHARED_SECRET ?? ''),
      },
      body,
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    console.error('[notifyN8n]', event, err)
  }
}
