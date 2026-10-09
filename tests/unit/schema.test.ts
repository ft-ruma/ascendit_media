import { describe, expect, it } from 'vitest'
import { leadSchema } from '@/builder/lead-schema'
import { validateStep } from '@/builder/schema'

const contact = { name: 'Test Person', email: 'a@b.co', whatsapp: '+94 77 123 4567', bestTime: 'any' }
const answers = {
  what: { pillars: ['web'], products: [] },
  business: { industry: 'Retail', size: '1-9', location: 'LK', registered: false },
  scope: { web: { type: 'site', pages: '1-5' } },
  timeline: '1-3m',
  budget: 'lkr-2',
}

describe('builder step schemas', () => {
  it('requires at least one pick on step 1', () => {
    expect(validateStep('what', { what: { pillars: [], products: [] } }).success).toBe(false)
    expect(validateStep('what', { what: { pillars: [], products: ['pos'] } }).success).toBe(true)
  })

  it('only validates scope for pillars that were picked', () => {
    const r = validateStep('scope', { what: { pillars: ['retail'], products: [] }, scope: {} } as never)
    expect(r.success).toBe(false)
    expect(validateStep('scope', { what: { pillars: [], products: ['pos'] }, scope: {} } as never).success).toBe(true)
  })

  it('rejects a tiny floor area', () => {
    const r = validateStep('scope', { what: { pillars: ['retail'], products: [] }, scope: { retail: { floorArea: 10, service: 'design', renders: 'stills' } } } as never)
    expect(r.success).toBe(false)
  })

  it('validates contact details', () => {
    expect(validateStep('contact', { contact: { ...contact, email: 'nope' } } as never).success).toBe(false)
    expect(validateStep('contact', { contact } as never).success).toBe(true)
  })
})

describe('leadSchema', () => {
  it('accepts a complete builder lead', () => {
    expect(leadSchema.safeParse({ type: 'builder', status: 'complete', answers, contact, currency: 'LKR' }).success).toBe(true)
  })

  it('accepts an unfinished lead with only an email', () => {
    expect(leadSchema.safeParse({ type: 'builder', status: 'unfinished', answers: {}, contact: { email: 'a@b.co' } }).success).toBe(true)
  })

  it('rejects an unfinished lead with no way to reach them', () => {
    expect(leadSchema.safeParse({ type: 'builder', status: 'unfinished', answers: {}, contact: { name: 'x' } }).success).toBe(false)
  })

  it('rejects a complete lead with a missing step', () => {
    const { timeline: _t, ...partial } = answers
    expect(leadSchema.safeParse({ type: 'builder', status: 'complete', answers: partial, contact }).success).toBe(false)
  })

  it('accepts demo and career leads', () => {
    expect(leadSchema.safeParse({ type: 'demo', product: 'pos', contact }).success).toBe(true)
    expect(leadSchema.safeParse({ type: 'career', role: 'Dev', contact: { ...contact, portfolio: 'https://x.dev', message: 'I would love to build stores and apps.' } }).success).toBe(true)
  })
})
