import { z } from 'zod'
import { answersSchema, contactSchema, PRODUCTS } from './schema'

// Everything that posts to /api/lead. Complete builder briefs are validated in
// full; unfinished (beacon) ones only need a reachable contact.

const meta = {
  currency: z.enum(['LKR', 'USD']).default('USD'),
  source: z.string().max(60).optional(),
  page: z.string().max(300).optional(),
  turnstileToken: z.string().max(4096).nullish(),
  website: z.string().max(200).optional(), // honeypot
}

export const builderComplete = z.object({
  type: z.literal('builder'),
  status: z.literal('complete'),
  answers: answersSchema,
  contact: contactSchema,
  ...meta,
})

export const builderUnfinished = z.object({
  type: z.literal('builder'),
  status: z.literal('unfinished'),
  answers: z.record(z.string(), z.unknown()),
  contact: z
    .object({
      name: z.string().max(120).optional(),
      company: z.string().max(120).optional(),
      email: z.email().optional(),
      whatsapp: z.string().regex(/^\+?[0-9 ()-]{7,20}$/).optional(),
    })
    .refine((c) => c.email || c.whatsapp, 'Need an email or WhatsApp'),
  ...meta,
})

export const contactLead = z.object({
  type: z.literal('contact'),
  status: z.literal('complete').default('complete'),
  contact: contactSchema.extend({ message: z.string().trim().min(10, 'Tell us a little more').max(4000) }),
  ...meta,
})

export const demoLead = z.object({
  type: z.literal('demo'),
  status: z.literal('complete').default('complete'),
  product: z.enum(PRODUCTS),
  contact: contactSchema.extend({ message: z.string().max(2000).optional() }),
  ...meta,
})

export const careerLead = z.object({
  type: z.literal('career'),
  status: z.literal('complete').default('complete'),
  role: z.string().max(120),
  contact: contactSchema.extend({
    portfolio: z.url('Enter a full link, starting with https://').max(500),
    message: z.string().trim().min(20, 'A few lines about you, please').max(4000),
  }),
  ...meta,
})

export const leadSchema = z.union([builderComplete, builderUnfinished, contactLead, demoLead, careerLead])
export type LeadInput = z.infer<typeof leadSchema>
