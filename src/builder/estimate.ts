// Pure estimate: same code runs in the browser for the live range and in
// /api/lead to re-check it before the lead is saved. Never reads globals.
import type { Currency, Multiplier, RateCard } from '@/lib/types'
import type { Answers } from './schema'

export type EstimateInput = {
  what: Answers['what']
  scope: Partial<Answers['scope']>
}

export type ProductLine = { slug: string; name: string; plan: string; monthly: number; setup: number }

export type Estimate = {
  low: number
  high: number
  saving: number
  cur: Currency
  products: ProductLine[]
}

type ScopeAnswers = Record<string, unknown> | undefined

export function matches(scope: ScopeAnswers, m: Multiplier) {
  if (!scope) return false
  const v = scope[m.question]
  return Array.isArray(v) ? v.includes(m.answer) : String(v) === m.answer
}

/** Design, POS, online store, launch content: two or more earns the bundle saving. */
export function countRetailPieces(a: EstimateInput) {
  let n = 0
  if (a.what.pillars.includes('retail')) n++
  if (a.what.products.includes('pos')) n++
  if (a.what.pillars.includes('web') && a.scope.web?.type === 'store') n++
  if (a.what.pillars.includes('brand') && a.scope.brand?.deliverable === 'identity-content') n++
  return n
}

export function isStoreToSystem(a: EstimateInput) {
  return countRetailPieces(a) >= 3
}

export function roundTo(n: number, step: number) {
  if (step <= 0) return Math.round(n)
  return Math.round(n / step) * step
}

export function estimate(a: EstimateInput, card: RateCard, cur: Currency): Estimate {
  const { rangeWidth, bundleSavingPct, roundLKR, roundUSD } = card.pricing
  let low = 0
  let high = 0
  for (const pillar of a.what.pillars) {
    const r = card.entries[pillar]
    if (!r) continue
    const scope = a.scope[pillar] as ScopeAnswers
    let base = cur === 'LKR' ? r.basePriceLKR : r.basePriceUSD
    if (r.unit === 'sqft') base *= Math.max(0, Number(scope?.floorArea) || 0)
    const f = r.multipliers.filter((m) => matches(scope, m)).reduce((x, m) => x * m.factor, 1)
    low += base * f
    high += base * f * rangeWidth
  }
  const saving = countRetailPieces(a) >= 2 ? bundleSavingPct : 0
  const step = cur === 'LKR' ? roundLKR : roundUSD

  const products: ProductLine[] = a.what.products.flatMap((slug) => {
    const p = card.products[slug]
    if (!p) return []
    return [{
      slug,
      name: p.name,
      plan: p.plan.name,
      monthly: cur === 'LKR' ? p.plan.LKR : p.plan.USD,
      setup: cur === 'LKR' ? p.plan.setupLKR : p.plan.setupUSD,
    }]
  })

  return {
    low: roundTo(low * (1 - saving), step),
    high: roundTo(high * (1 - saving), step),
    saving,
    cur,
    products,
  }
}
