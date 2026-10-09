// Front-end shapes. Payload docs and the built-in seed both map onto these,
// so templates never care where the content came from.

export type PillarKey = 'software' | 'retail' | 'web' | 'brand'
export type Currency = 'LKR' | 'USD'
export type Accent = 'lilac' | 'tangerine' | 'aqua' | 'lime'

export type Media = {
  url: string
  alt: string
  width?: number | null
  height?: number | null
  mimeType?: string | null
  poster?: Media | null
} | null

export type Seo = { title?: string | null; description?: string | null; image?: Media }

export type Pillar = {
  key: PillarKey
  slug: string
  name: string
  accent: Accent
  oneLiner: string
  h1: string
  intro: string
  capabilities: string[]
  process: { title: string; body: string }[]
  tools: string[]
  fromPriceLKR: number
  fromPriceUSD: number
  seo?: Seo
}

export type Testimonial = {
  quote: string
  person: string
  role?: string | null
  company: string
  caseStudy?: string | null
}

export type CaseStudy = {
  slug: string
  client: string
  logo?: Media
  industry: string
  location: 'LK' | 'intl'
  pillars: PillarKey[]
  result: string
  brief: string
  approach: { pillar: PillarKey; body: string }[]
  metrics: { label: string; value: string; unit?: string | null }[]
  gallery: NonNullable<Media>[]
  video?: Media
  quote?: Testimonial | null
  cover?: Media
  windowFileName: string
  featured: boolean
  publishedAt: string
  seo?: Seo
}

export type ProductPlan = {
  name: string
  LKR: number
  USD: number
  yearlyDiscountPct: number
  setupLKR: number
  setupUSD: number
  highlight?: boolean | null
}

export type Product = {
  slug: string
  name: string
  glyph: string
  accent: Accent
  appIcon?: Media
  pitch: string
  audience: string
  features: { title: string; body: string }[]
  plans: ProductPlan[]
  demoUrl?: string | null
  trialUrl?: string | null
  screenRecording?: Media
  faq: { q: string; a: string }[]
  seo?: Seo
}

export type Multiplier = { question: string; answer: string; factor: number }

export type RateCardEntry = {
  pillar: PillarKey
  unit: 'project' | 'sqft'
  basePriceLKR: number
  basePriceUSD: number
  multipliers: Multiplier[]
}

export type Pricing = {
  bundleSavingPct: number
  rangeWidth: number
  roundLKR: number
  roundUSD: number
}

export type RateCard = {
  entries: Partial<Record<PillarKey, RateCardEntry>>
  pricing: Pricing
  products: Record<string, { name: string; plan: ProductPlan }>
}

export type TeamMember = { name: string; role: string; portraitLoop?: Media; order: number }

export type Career = {
  slug: string
  title: string
  type: string
  location: string
  summary: string
  description: string[]
  open: boolean
}

export type Settings = {
  stats: { clients: number; team: number; products: number; years: number }
  whatsapp: string
  bookingUrl: string
  email: string
  phone: string
  office: { line1: string; city: string; country: string; mapUrl: string }
  socials: { label: string; url: string }[]
  openForProjects: boolean
  founderNote: { quote: string; name: string; role: string; video?: Media }
}

export type LegalPage = {
  slug: string
  title: string
  updated: string
  body: string[] | Record<string, unknown>
}
