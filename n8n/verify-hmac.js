// n8n Code node "Verify signature" (Run once for all items), first after the Webhook node.
// Webhook node: enable "Raw Body" so the signature is checked over the exact bytes sent.
const crypto = require('crypto')
const secret = $env.N8N_SHARED_SECRET
const item = $input.first()
const raw = Buffer.from(item.binary?.data?.data ?? '', 'base64').toString('utf8') || JSON.stringify(item.json.body)
const given = item.json.headers?.['x-ascendit-signature'] ?? ''
const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
const ok = given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
if (!ok) throw new Error('Invalid signature')
return [{ json: JSON.parse(raw) }]
