import { createHmac, timingSafeEqual } from 'node:crypto'

/** HMAC-SHA256 hex signature n8n verifies in its first node. */
export function sign(body: string, secret: string) {
  return createHmac('sha256', secret).update(body).digest('hex')
}

export function verify(body: string, signature: string, secret: string) {
  const expected = Buffer.from(sign(body, secret), 'hex')
  const given = Buffer.from(signature, 'hex')
  return expected.length === given.length && timingSafeEqual(expected, given)
}
