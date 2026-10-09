// One zod schema per builder step, shared by the client (per-step validation)
// and /api/lead (full re-validation). Option lists live here so labels, the
// estimate and lead scoring all read the same values.
import { z } from 'zod'

export const PILLARS = ['retail', 'software', 'web', 'brand'] as const
export const PRODUCTS = ['pos', 'crm', 'caresuite'] as const

export const OPTIONS = {
  industry: ['Retail', 'Grocery & FMCG', 'Fashion', 'Healthcare', 'Hospitality', 'Services', 'Manufacturing', 'Other'],
  size: [
    { id: '1-9', label: '1 to 9 people' },
    { id: '10-49', label: '10 to 49 people' },
    { id: '50+', label: '50 or more' },
  ],
  location: [
    { id: 'LK', label: 'Sri Lanka' },
    { id: 'overseas', label: 'Overseas' },
  ],
  timeline: [
    { id: 'under-1m', label: 'Under a month' },
    { id: '1-3m', label: '1 to 3 months' },
    { id: 'later', label: 'Later, just planning' },
  ],
  web: {
    type: [
      { id: 'site', label: 'Website' },
      { id: 'store', label: 'Online store' },
    ],
    pages: [
      { id: '1-5', label: '1 to 5 pages' },
      { id: '6-15', label: '6 to 15 pages' },
      { id: '16-40', label: '16 to 40 pages' },
    ],
    storeSize: [
      { id: '<50', label: 'Under 50 products' },
      { id: '50-500', label: '50 to 500 products' },
      { id: '500+', label: '500+ products' },
    ],
  },
  retail: {
    service: [
      { id: 'design', label: 'Design only' },
      { id: 'design-supervision', label: 'Design + site supervision' },
    ],
    renders: [
      { id: 'stills', label: 'Render stills' },
      { id: 'walkthrough', label: 'Stills + video walkthrough' },
    ],
  },
  software: {
    modules: [
      { id: '1-2', label: '1 or 2 modules' },
      { id: '3-5', label: '3 to 5 modules' },
      { id: '6+', label: '6 or more' },
    ],
    platform: [
      { id: 'web', label: 'Web app' },
      { id: 'web-mobile', label: 'Web + mobile app' },
    ],
  },
  brand: {
    deliverable: [
      { id: 'identity', label: 'Identity' },
      { id: 'identity-content', label: 'Identity + launch content' },
    ],
    channels: [
      { id: '1-2', label: '1 or 2 channels' },
      { id: '3-4', label: '3 or 4 channels' },
      { id: '5+', label: '5 or more' },
    ],
    volume: [
      { id: 'none', label: 'No ongoing content' },
      { id: 'up-to-12', label: 'Up to 12 posts a month' },
      { id: '13-30', label: '13 to 30 a month' },
      { id: '30+', label: '30+ a month' },
    ],
  },
} as const

// Budget bands per currency; `max` is what scoring compares to the estimate.
export const BUDGETS = {
  LKR: [
    { id: 'lkr-1', label: 'Under LKR 250k', min: 0, max: 250_000 },
    { id: 'lkr-2', label: 'LKR 250k to 750k', min: 250_000, max: 750_000 },
    { id: 'lkr-3', label: 'LKR 750k to 2M', min: 750_000, max: 2_000_000 },
    { id: 'lkr-4', label: 'LKR 2M to 5M', min: 2_000_000, max: 5_000_000 },
    { id: 'lkr-5', label: 'Over LKR 5M', min: 5_000_000, max: Number.MAX_SAFE_INTEGER },
  ],
  USD: [
    { id: 'usd-1', label: 'Under $1k', min: 0, max: 1_000 },
    { id: 'usd-2', label: '$1k to $3k', min: 1_000, max: 3_000 },
    { id: 'usd-3', label: '$3k to $7.5k', min: 3_000, max: 7_500 },
    { id: 'usd-4', label: '$7.5k to $20k', min: 7_500, max: 20_000 },
    { id: 'usd-5', label: 'Over $20k', min: 20_000, max: Number.MAX_SAFE_INTEGER },
  ],
} as const

const ids = <T extends readonly { id: string }[]>(list: T) =>
  list.map((o) => o.id) as unknown as [T[number]['id'], ...T[number]['id'][]]

export const whatSchema = z
  .object({
    pillars: z.array(z.enum(PILLARS)),
    products: z.array(z.enum(PRODUCTS)),
  })
  .refine((v) => v.pillars.length + v.products.length > 0, { message: 'Pick at least one thing', path: ['pillars'] })

export const businessSchema = z.object({
  industry: z.enum(OPTIONS.industry),
  size: z.enum(ids(OPTIONS.size)),
  location: z.enum(ids(OPTIONS.location)),
  registered: z.boolean(),
})

export const scopeSchemas = {
  web: z.object({
    type: z.enum(ids(OPTIONS.web.type)),
    pages: z.enum(ids(OPTIONS.web.pages)),
    storeSize: z.enum(ids(OPTIONS.web.storeSize)).optional(),
  }),
  retail: z.object({
    floorArea: z.coerce.number().int().min(50, 'At least 50 sq ft').max(200_000),
    service: z.enum(ids(OPTIONS.retail.service)),
    renders: z.enum(ids(OPTIONS.retail.renders)),
  }),
  software: z.object({
    modules: z.enum(ids(OPTIONS.software.modules)),
    platform: z.enum(ids(OPTIONS.software.platform)),
  }),
  brand: z.object({
    deliverable: z.enum(ids(OPTIONS.brand.deliverable)),
    channels: z.enum(ids(OPTIONS.brand.channels)),
    volume: z.enum(ids(OPTIONS.brand.volume)),
  }),
} as const

export const scopeSchema = z.object({
  web: scopeSchemas.web.optional(),
  retail: scopeSchemas.retail.optional(),
  software: scopeSchemas.software.optional(),
  brand: scopeSchemas.brand.optional(),
})

export const timelineSchema = z.enum(ids(OPTIONS.timeline))
export const budgetSchema = z.string().refine(
  (v) => [...BUDGETS.LKR, ...BUDGETS.USD].some((b) => b.id === v),
  'Pick a budget range',
)

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name'),
  company: z.string().trim().max(120).optional().default(''),
  email: z.email('Enter a valid email'),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number'),
  bestTime: z.enum(['morning', 'afternoon', 'evening', 'any']).default('any'),
})

export const answersSchema = z.object({
  what: whatSchema,
  business: businessSchema,
  scope: scopeSchema,
  timeline: timelineSchema,
  budget: budgetSchema,
})

export type Answers = z.infer<typeof answersSchema>
export type Contact = z.infer<typeof contactSchema>
export type Pillar = (typeof PILLARS)[number]
export type ProductSlug = (typeof PRODUCTS)[number]

export const STEPS = ['what', 'business', 'scope', 'timeline', 'budget', 'contact'] as const
export type Step = (typeof STEPS)[number]

export function budgetBand(id: string) {
  return [...BUDGETS.LKR, ...BUDGETS.USD].find((b) => b.id === id)
}

/** Validate the part of the answers that belongs to one step. */
export function validateStep(step: Step, a: Partial<Answers> & { contact?: Partial<Contact> }) {
  switch (step) {
    case 'what':
      return whatSchema.safeParse(a.what)
    case 'business':
      return businessSchema.safeParse(a.business)
    case 'scope': {
      const picked = a.what?.pillars ?? []
      const shape = Object.fromEntries(picked.map((p) => [p, scopeSchemas[p]]))
      return z.object(shape).safeParse(a.scope ?? {})
    }
    case 'timeline':
      return timelineSchema.safeParse(a.timeline)
    case 'budget':
      return budgetSchema.safeParse(a.budget)
    case 'contact':
      return contactSchema.safeParse(a.contact)
  }
}
