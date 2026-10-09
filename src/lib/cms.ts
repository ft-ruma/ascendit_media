import 'server-only'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import * as seed from '@/seed/data'
import type {
  CaseStudy, Career, LegalPage, Media, Pillar, PillarKey, Pricing, Product, RateCard, RateCardEntry, Settings,
  TeamMember, Testimonial,
} from './types'

// Every page reads content through these functions. With DATABASE_URI set they
// query Payload's local API (no HTTP hop); without it they return the built-in
// seed so the site runs with zero setup. A CMS error falls back to seed too,
// so a database blip never takes the public site down.

const cmsEnabled = !!process.env.DATABASE_URI

const getPayloadClient = cache(async () => {
  const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
  return getPayload({ config })
})

async function isDraft() {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false // called outside a request (generateStaticParams, sitemap)
  }
}

async function fromCms<T>(label: string, query: () => Promise<T>, fallback: () => T): Promise<T> {
  if (!cmsEnabled) return fallback()
  try {
    return await query()
  } catch (err) {
    console.error(`[cms] ${label} failed, serving seed content`, err)
    return fallback()
  }
}

/* ---------------- mappers: Payload doc -> front-end shape ---------------- */

type Doc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const media = (m: unknown): Media => {
  if (!m || typeof m !== 'object') return null
  const d = m as Doc
  return {
    url: d.url,
    alt: d.alt ?? '',
    width: d.width,
    height: d.height,
    mimeType: d.mimeType,
    poster: d.poster && typeof d.poster === 'object' ? media(d.poster) : null,
  }
}
const items = (arr: Doc[] | undefined, key = 'item') => (arr ?? []).map((x) => x[key] as string)
const seo = (d: Doc) => ({ title: d.seo?.title, description: d.seo?.description, image: media(d.seo?.image) })

const toPillar = (d: Doc): Pillar => ({
  key: d.key,
  slug: d.slug,
  name: d.name,
  accent: d.accent,
  oneLiner: d.oneLiner,
  h1: d.h1,
  intro: d.intro,
  capabilities: items(d.capabilities),
  process: (d.process ?? []).map((p: Doc) => ({ title: p.title, body: p.body })),
  tools: items(d.tools),
  fromPriceLKR: d.fromPriceLKR,
  fromPriceUSD: d.fromPriceUSD,
  seo: seo(d),
})

const toTestimonial = (d: Doc): Testimonial => ({
  quote: d.quote,
  person: d.person,
  role: d.role,
  company: d.company,
  caseStudy: typeof d.caseStudy === 'object' ? d.caseStudy?.slug : null,
})

const toCaseStudy = (d: Doc): CaseStudy => ({
  slug: d.slug,
  client: d.client,
  logo: media(d.logo),
  industry: d.industry,
  location: d.location,
  pillars: d.pillars ?? [],
  result: d.result,
  brief: d.brief,
  approach: (d.approach ?? []).map((a: Doc) => ({ pillar: a.pillar, body: a.body })),
  metrics: (d.metrics ?? []).map((m: Doc) => ({ label: m.label, value: m.value, unit: m.unit })),
  gallery: (d.gallery ?? []).map(media).filter(Boolean),
  video: media(d.video),
  quote: d.quote && typeof d.quote === 'object' ? toTestimonial(d.quote) : null,
  cover: media(d.cover),
  windowFileName: d.windowFileName,
  featured: !!d.featured,
  publishedAt: d.publishedAt,
  seo: seo(d),
})

const toProduct = (d: Doc): Product => ({
  slug: d.slug,
  name: d.name,
  glyph: d.glyph,
  accent: d.accent,
  appIcon: media(d.appIcon),
  pitch: d.pitch,
  audience: d.audience,
  features: (d.features ?? []).map((f: Doc) => ({ title: f.title, body: f.body })),
  plans: (d.plans ?? []).map((p: Doc) => ({
    name: p.name,
    LKR: p.LKR,
    USD: p.USD,
    yearlyDiscountPct: p.yearlyDiscountPct ?? 0,
    setupLKR: p.setupLKR,
    setupUSD: p.setupUSD,
    highlight: p.highlight,
  })),
  demoUrl: d.demoUrl,
  trialUrl: d.trialUrl,
  screenRecording: media(d.screenRecording),
  faq: (d.faq ?? []).map((f: Doc) => ({ q: f.q, a: f.a })),
  seo: seo(d),
})

/* ---------------- queries ---------------- */

export const getSettings = cache(() =>
  fromCms<Settings>(
    'settings',
    async () => {
      const d = (await (await getPayloadClient()).findGlobal({ slug: 'settings', depth: 1 })) as Doc
      return {
        stats: d.stats,
        whatsapp: d.whatsapp,
        bookingUrl: d.bookingUrl,
        email: d.email,
        phone: d.phone,
        office: d.office,
        socials: d.socials ?? [],
        openForProjects: d.openForProjects ?? true,
        founderNote: { ...d.founderNote, video: media(d.founderNote?.video) },
      }
    },
    () => seed.settings,
  ),
)

export const getPillars = cache(() =>
  fromCms(
    'pillars',
    async () => {
      const { docs } = await (await getPayloadClient()).find({ collection: 'pillars', limit: 10, depth: 1 })
      const order: PillarKey[] = ['retail', 'software', 'web', 'brand']
      return (docs as Doc[]).map(toPillar).sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
    },
    () => seed.pillars,
  ),
)

export const getPillar = cache(async (slug: string) => (await getPillars()).find((p) => p.slug === slug) ?? null)

export const getCaseStudies = cache(() =>
  fromCms(
    'case-studies',
    async () => {
      const { docs } = await (await getPayloadClient()).find({
        collection: 'case-studies',
        limit: 100,
        depth: 2,
        sort: '-publishedAt',
        draft: await isDraft(),
        where: (await isDraft()) ? undefined : { _status: { equals: 'published' } },
      })
      return (docs as Doc[]).map(toCaseStudy)
    },
    () => seed.caseStudies,
  ),
)

export const getCaseStudy = cache(async (slug: string) => (await getCaseStudies()).find((c) => c.slug === slug) ?? null)

export const getProducts = cache(() =>
  fromCms(
    'products',
    async () => {
      const { docs } = await (await getPayloadClient()).find({
        collection: 'products',
        limit: 20,
        depth: 1,
        sort: 'createdAt',
        draft: await isDraft(),
        where: (await isDraft()) ? undefined : { _status: { equals: 'published' } },
      })
      return (docs as Doc[]).map(toProduct)
    },
    () => seed.products,
  ),
)

export const getProduct = cache(async (slug: string) => (await getProducts()).find((p) => p.slug === slug) ?? null)

export const getTestimonials = cache(() =>
  fromCms(
    'testimonials',
    async () => {
      const { docs } = await (await getPayloadClient()).find({ collection: 'testimonials', limit: 50, depth: 1 })
      return (docs as Doc[]).map(toTestimonial)
    },
    () => seed.testimonials,
  ),
)

export const getTeam = cache(() =>
  fromCms<TeamMember[]>(
    'team',
    async () => {
      const { docs } = await (await getPayloadClient()).find({ collection: 'team', limit: 50, depth: 1, sort: 'order' })
      return (docs as Doc[]).map((d) => ({ name: d.name, role: d.role, order: d.order, portraitLoop: media(d.portraitLoop) }))
    },
    () => seed.team,
  ),
)

export const getCareers = cache(() =>
  fromCms<Career[]>(
    'careers',
    async () => {
      const { docs } = await (await getPayloadClient()).find({ collection: 'careers', limit: 50, where: { open: { equals: true } } })
      return (docs as Doc[]).map((d) => ({
        slug: d.slug,
        title: d.title,
        type: d.type,
        location: d.location,
        summary: d.summary,
        description: items(d.description, 'paragraph'),
        open: d.open,
      }))
    },
    () => seed.careers.filter((c) => c.open),
  ),
)

export const getCareer = cache(async (slug: string) => (await getCareers()).find((c) => c.slug === slug) ?? null)

export const getLegalPage = cache((slug: string) =>
  fromCms<LegalPage | null>(
    `pages/${slug}`,
    async () => {
      const { docs } = await (await getPayloadClient()).find({ collection: 'pages', limit: 1, where: { slug: { equals: slug } } })
      const d = docs[0] as Doc | undefined
      if (!d) return seed.legalPages.find((p) => p.slug === slug) ?? null
      return { slug: d.slug, title: d.title, updated: d.updatedAt, body: d.content }
    },
    () => seed.legalPages.find((p) => p.slug === slug) ?? null,
  ),
)

/** Rate card + estimate settings + first plan of each product: everything estimate() needs. */
export const getRateCard = cache(async (): Promise<RateCard> => {
  const [entries, pricing, products] = await Promise.all([
    fromCms<RateCardEntry[]>(
      'rate-card',
      async () => {
        const { docs } = await (await getPayloadClient()).find({ collection: 'rate-card', limit: 10 })
        return (docs as Doc[]).map((d) => ({
          pillar: d.pillar,
          unit: d.unit,
          basePriceLKR: d.basePriceLKR,
          basePriceUSD: d.basePriceUSD,
          multipliers: (d.multipliers ?? []).map((m: Doc) => ({ question: m.question, answer: m.answer, factor: m.factor })),
        }))
      },
      () => seed.rateCard,
    ),
    fromCms<Pricing>(
      'pricing',
      async () => {
        const d = (await (await getPayloadClient()).findGlobal({ slug: 'pricing' })) as Doc
        return { bundleSavingPct: d.bundleSavingPct, rangeWidth: d.rangeWidth, roundLKR: d.roundLKR, roundUSD: d.roundUSD }
      },
      () => seed.pricing,
    ),
    getProducts(),
  ])
  return {
    entries: Object.fromEntries(entries.map((e) => [e.pillar, e])),
    pricing,
    products: Object.fromEntries(products.filter((p) => p.plans[0]).map((p) => [p.slug, { name: p.name, plan: p.plans[0] }])),
  }
})
