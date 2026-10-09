import { describe, expect, it } from 'vitest'
import { countRetailPieces, estimate, isStoreToSystem, roundTo } from '@/builder/estimate'
import * as seed from '@/seed/data'
import type { RateCard } from '@/lib/types'

const card: RateCard = {
  entries: Object.fromEntries(seed.rateCard.map((e) => [e.pillar, e])),
  pricing: seed.pricing,
  products: Object.fromEntries(seed.products.map((p) => [p.slug, { name: p.name, plan: p.plans[0] }])),
}
const what = (pillars: string[] = [], products: string[] = []) => ({ pillars, products }) as never

describe('estimate()', () => {
  it('returns zero with no pillars', () => {
    const e = estimate({ what: what(), scope: {} }, card, 'LKR')
    expect(e).toMatchObject({ low: 0, high: 0, saving: 0, products: [] })
  })

  it('prices web at base with no matching multipliers', () => {
    const e = estimate({ what: what(['web']), scope: { web: { type: 'site', pages: '1-5' } } }, card, 'LKR')
    expect(e.low).toBe(180_000)
    expect(e.high).toBe(roundTo(180_000 * 1.6, 5000))
  })

  it('applies every matching multiplier', () => {
    const e = estimate({ what: what(['web']), scope: { web: { type: 'store', pages: '6-15', storeSize: '500+' } } }, card, 'USD')
    expect(e.low).toBe(roundTo(900 * 1.5 * 1.6 * 1.5, 50))
  })

  it('prices retail per square foot times floor area', () => {
    const e = estimate({ what: what(['retail']), scope: { retail: { floorArea: 1000, service: 'design', renders: 'stills' } } }, card, 'LKR')
    expect(e.low).toBe(120_000)
  })

  it('treats zero floor area as zero, not NaN', () => {
    const e = estimate({ what: what(['retail']), scope: { retail: { floorArea: 0, service: 'design', renders: 'stills' } } }, card, 'LKR')
    expect(e.low).toBe(0)
    expect(Number.isNaN(e.high)).toBe(false)
  })

  it('works for every pillar in both currencies', () => {
    for (const cur of ['LKR', 'USD'] as const) {
      const e = estimate(
        {
          what: what(['retail', 'software', 'web', 'brand']),
          scope: {
            retail: { floorArea: 1500, service: 'design', renders: 'stills' },
            software: { modules: '3-5', platform: 'web' },
            web: { type: 'site', pages: '1-5' },
            brand: { deliverable: 'identity', channels: '1-2', volume: 'none' },
          },
        },
        card,
        cur,
      )
      expect(e.low).toBeGreaterThan(0)
      expect(e.high).toBeGreaterThan(e.low)
      expect(e.cur).toBe(cur)
    }
  })

  it('gives the bundle saving for two or more retail pieces', () => {
    const scope = { retail: { floorArea: 1000, service: 'design', renders: 'stills' } } as never
    const solo = estimate({ what: what(['retail']), scope }, card, 'LKR')
    const bundle = estimate({ what: what(['retail'], ['pos']), scope }, card, 'LKR')
    expect(solo.saving).toBe(0)
    expect(bundle.saving).toBe(0.1)
    expect(bundle.low).toBe(roundTo(120_000 * 0.9, 5000))
  })

  it('adds products as a separate monthly line with setup fee', () => {
    const e = estimate({ what: what([], ['pos', 'crm']), scope: {} }, card, 'USD')
    expect(e.low).toBe(0)
    expect(e.products).toEqual([
      { slug: 'pos', name: 'Ascendit POS', plan: 'Starter', monthly: 19, setup: 60 },
      { slug: 'crm', name: 'Ascendit CRM', plan: 'Team', monthly: 29, setup: 80 },
    ])
  })

  it('counts Store to System pieces', () => {
    const a = { what: what(['retail', 'web', 'brand'], ['pos']), scope: { web: { type: 'store' }, brand: { deliverable: 'identity-content' } } } as never
    expect(countRetailPieces(a)).toBe(4)
    expect(isStoreToSystem(a)).toBe(true)
  })

  it('reads range width and rounding from the card', () => {
    const tuned = { ...card, pricing: { ...card.pricing, rangeWidth: 2, roundLKR: 1000 } }
    const e = estimate({ what: what(['web']), scope: { web: { type: 'site', pages: '1-5' } } }, tuned, 'LKR')
    expect(e.high).toBe(360_000)
  })
})
