import { describe, expect, it } from 'vitest'
import { scoreLead } from '@/lib/scoring'

describe('scoreLead()', () => {
  it('scores a hot Store to System lead', () => {
    const r = scoreLead({ type: 'builder', pillars: ['retail', 'web'], storeToSystem: true, timeline: '1-3m', registered: true, size: '10-49', location: 'LK', budgetMax: 2_000_000, estimateLow: 870_000 })
    expect(r.score).toBe(90)
    expect(r.tier).toBe('hot')
  })

  it('scores a warm lead', () => {
    const r = scoreLead({ type: 'builder', pillars: ['web'], storeToSystem: false, timeline: 'under-1m', registered: false, size: '1-9', location: 'overseas', budgetMax: 3000, estimateLow: 900 })
    expect(r.score).toBe(55)
    expect(r.tier).toBe('warm')
  })

  it('puts a vague lead in nurture', () => {
    const r = scoreLead({ type: 'contact', pillars: [], storeToSystem: false })
    expect(r).toMatchObject({ score: 0, tier: 'nurture' })
  })

  it('gives +10 for product demos', () => {
    expect(scoreLead({ type: 'demo', pillars: [], storeToSystem: false }).score).toBe(10)
  })

  it('does not award budget points when budget is below the estimate', () => {
    const r = scoreLead({ type: 'builder', pillars: ['software'], storeToSystem: false, budgetMax: 250_000, estimateLow: 450_000 })
    expect(r.reasons.some((x) => x.includes('budget'))).toBe(false)
  })

  it('treats the 70 and 40 thresholds as inclusive', () => {
    expect(scoreLead({ type: 'builder', pillars: ['retail', 'web'], storeToSystem: false, timeline: '1-3m', registered: true, location: 'LK' }).score).toBe(60)
    expect(scoreLead({ type: 'builder', pillars: ['retail', 'web'], storeToSystem: false, timeline: '1-3m', registered: true, location: 'overseas' }).tier).toBe('hot')
  })
})
