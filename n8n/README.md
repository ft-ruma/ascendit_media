# n8n: `lead-intake`

Every form on the site posts to `/api/lead`, which validates, re-runs the estimate,
and POSTs a signed JSON payload to `N8N_LEAD_WEBHOOK`. n8n owns scoring and routing,
so thresholds and alerts change without a deploy.

Build two copies at auto.ascendit.dev: `lead-intake` (production) and
`lead-intake-test` (points at a CRM test project; Preview deployments use it).

## Nodes

1. **Webhook** – POST, "Raw Body" on. Respond immediately (200).
2. **Verify signature** – Code node, paste [`verify-hmac.js`](./verify-hmac.js).
   Set `N8N_SHARED_SECRET` in n8n's environment to the same value as the site.
3. **Score lead** – Code node ("Run once for each item"), paste [`score-lead.js`](./score-lead.js).
   This file is generated from `src/lib/scoring.ts` by `pnpm n8n:score`; regenerate and
   re-paste whenever scoring changes, so n8n runs exactly what the unit tests cover.
4. **Upsert client + create project** – Supabase/Postgres node into the Ascendit CRM
   with `score`, `tier`, `answers`, `estimate`, `attribution` (UTM, gclid, fbclid, landing).
   Upsert on email, then WhatsApp. `status: unfinished` leads are stored as unfinished.
5. **Switch on `tier`**
   - `hot` (70+): WhatsApp alert to the team, set reply-same-day.
   - `warm` (40–69): email a discovery-call link, schedule a 2-day follow-up.
   - `nurture` (<40): email case studies, tag for re-scoring.
6. **Auto-reply** to the visitor with their brief and estimate (complete leads only).
7. **Google Ads offline conversion** – when `attribution.gclid` is present (Meta CAPI is
   already sent server-side by the site).

## Other paths into the same workflow

- **Booking**: point the Cal.com/Calendly booking webhook at the same Webhook URL with a
  `type: booking` mapping (Set node before step 3), creating the lead if new.
- **WhatsApp**: click-to-chat links carry the page; logging chats needs the WhatsApp
  Business API connected to n8n.
- **Content events**: set `N8N_EVENTS_WEBHOOK` to receive `case-study.published` when a
  case study is first published.

## Payload shape

```json
{
  "reference": "ASC-261009-1A2B",
  "type": "builder",            // builder | contact | demo | career
  "status": "complete",         // complete | unfinished
  "answers": { "what": {}, "business": {}, "scope": {}, "timeline": "1-3m", "budget": "lkr-3" },
  "estimate": { "low": 870000, "high": 1390000, "cur": "LKR", "saving": 0.1, "products": [] },
  "derived": { "storeToSystem": false, "budgetMax": 2000000, "budgetCur": "LKR" },
  "contact": { "name": "", "company": "", "email": "", "whatsapp": "+94..." },
  "attribution": { "utm_source": "", "gclid": "", "landing": "/services/retail-design", "country": "LK", "currency": "LKR" }
}
```

Header `x-ascendit-signature` = HMAC-SHA256 (hex) of the raw body with `N8N_SHARED_SECRET`.
If n8n is unreachable after 3 attempts the lead is written to `cms.lead_outbox`
(visible to admins in Payload under Admin → Lead outbox).
