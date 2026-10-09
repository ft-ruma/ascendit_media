import { describe, expect, it } from 'vitest'
import { sign, verify } from '@/lib/sign'
import { rateLimit } from '@/lib/rate-limit'

describe('HMAC signing', () => {
  it('round-trips and rejects tampering', () => {
    const s = sign('{"a":1}', 'secret')
    expect(verify('{"a":1}', s, 'secret')).toBe(true)
    expect(verify('{"a":2}', s, 'secret')).toBe(false)
    expect(verify('{"a":1}', s, 'other')).toBe(false)
  })
})

describe('rateLimit', () => {
  it('allows 5 posts per 10 minutes per key', () => {
    const t = 1_000_000
    const results = Array.from({ length: 6 }, () => rateLimit('1.2.3.4', t).ok)
    expect(results).toEqual([true, true, true, true, true, false])
    expect(rateLimit('1.2.3.4', t + 10 * 60 * 1000 + 1).ok).toBe(true)
  })
})
