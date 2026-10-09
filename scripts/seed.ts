// pnpm seed: copies the built-in seed content into Payload (local or staging).
// Idempotent: existing docs (matched by slug / key) are updated, not duplicated.
// Never run against production after launch; editors own that content.
import { getPayload, type CollectionSlug, type Where } from 'payload'
import config from '@payload-config'
import * as seed from '../src/seed/data'

const lexical = (paragraphs: string[]) => ({
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
    children: paragraphs.map((text) => ({
      type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0,
      children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
    })),
  },
})

const payload = await getPayload({ config })

// Seed data is plain objects; Payload validates it at runtime, so the loose data type is fine here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsert(collection: CollectionSlug, where: Where, data: Record<string, any>): Promise<{ id: number }> {
  const { docs } = await payload.find({ collection, where, limit: 1, draft: true })
  if (docs[0]) return payload.update({ collection, id: docs[0].id, data, overrideAccess: true }) as Promise<{ id: number }>
  return payload.create({ collection, data, overrideAccess: true } as never) as Promise<{ id: number }>
}

const items = (arr: string[], key = 'item') => arr.map((v) => ({ [key]: v }))

if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
  await upsert('users', { email: { equals: process.env.SEED_ADMIN_EMAIL } }, {
    email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, name: 'Admin', roles: ['admin'],
  })
}

for (const p of seed.pillars) {
  await upsert('pillars', { key: { equals: p.key } }, { ...p, capabilities: items(p.capabilities), tools: items(p.tools) })
}

for (const r of seed.rateCard) await upsert('rate-card', { pillar: { equals: r.pillar } }, r)
await payload.updateGlobal({ slug: 'pricing', data: seed.pricing, overrideAccess: true })

const { founderNote, ...settings } = seed.settings
await payload.updateGlobal({ slug: 'settings', data: { ...settings, founderNote: { quote: founderNote.quote, name: founderNote.name, role: founderNote.role } }, overrideAccess: true })

for (const p of seed.products) {
  await upsert('products', { slug: { equals: p.slug } }, { ...p, appIcon: undefined, screenRecording: undefined, _status: 'published' })
}

const testimonialIds = new Map<string, number>()
for (const t of seed.testimonials) {
  const doc = await upsert('testimonials', { quote: { equals: t.quote } }, { quote: t.quote, person: t.person, role: t.role, company: t.company })
  testimonialIds.set(t.quote, doc.id)
}

for (const c of seed.caseStudies) {
  const doc = await upsert('case-studies', { slug: { equals: c.slug } }, {
    ...c,
    logo: undefined, cover: undefined, video: undefined, gallery: [],
    quote: c.quote ? testimonialIds.get(c.quote.quote) : undefined,
    seo: undefined,
    _status: 'published',
  })
  if (c.quote) await payload.update({ collection: 'testimonials', id: testimonialIds.get(c.quote.quote)!, data: { caseStudy: doc.id }, overrideAccess: true })
}

for (const m of seed.team) await upsert('team', { name: { equals: m.name } }, { name: m.name, role: m.role, order: m.order })
for (const c of seed.careers) await upsert('careers', { slug: { equals: c.slug } }, { ...c, description: items(c.description, 'paragraph') })
for (const p of seed.legalPages) {
  await upsert('pages', { slug: { equals: p.slug } }, { title: p.title, slug: p.slug, content: lexical(p.body as string[]) })
}

payload.logger.info('Seed complete')
process.exit(0)
