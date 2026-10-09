# Ascendit OS

The ascendit.dev website: one Next.js 15 app that serves the Ascendit OS front end,
hosts Payload CMS at `/admin`, and sends every lead through n8n into the Ascendit CRM.
Built from *Ascendit OS: Implementation Plan* (Oct 9, 2026).

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000, runs on built-in seed content, no database needed
```

With the CMS:

```bash
docker compose up -d                       # local Postgres
cp .env.example .env                       # set DATABASE_URI and PAYLOAD_SECRET
SEED_ADMIN_EMAIL=you@ascendit.dev SEED_ADMIN_PASSWORD=... pnpm seed
pnpm dev                                   # /admin to sign in
```

Without `DATABASE_URI` every page renders from `src/seed/data.ts`. With it, pages read
Payload's local API; if the database errors, pages fall back to seed so the public
site never goes down.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm typecheck` | TypeScript |
| `pnpm test` | Vitest: estimate, scoring, schemas, HMAC, rate limit |
| `pnpm test:e2e` | Playwright + axe, desktop and phone (`PW_CHANNEL=chrome` to use installed Chrome) |
| `pnpm size` | Fails if a public route ships over 200 KB first-load JS (run after build) |
| `pnpm seed` | Copy seed content into Payload (idempotent) |
| `pnpm migrate:create <name>` / `pnpm migrate` | Payload migrations (committed; production never pushes schema) |
| `pnpm generate:types` / `generate:importmap` | After changing collections |
| `pnpm n8n:score` | Regenerate `n8n/score-lead.js` from `src/lib/scoring.ts` |
| `scripts/encode.sh in.mov` | Encode a loop: AV1, WebM, MP4, poster, vertical crop |

## Where things live

```
src/
  app/(site)/          public pages (home, services, products, work, studio, careers, start, contact, legal)
  app/(payload)/       Payload admin + REST/GraphQL
  app/api/lead         builder + forms -> validate, spam checks, re-estimate, HMAC -> n8n (outbox on failure)
  app/api/revalidate   external cache purge;  api/preview: Payload live preview (draft mode)
  collections/ globals/  Payload config: pillars, case-studies, products, rate-card, testimonials, team, careers, pages, media, users, lead_outbox; settings, pricing
  os/                  MenuBar, Window, Dock, Boot, Sticker, Doodle, ChatBubble, LoopVideo, Showreel, window manager store
  sections/            home beats 1-8, page window, case grid, lead form
  builder/             schema.ts (zod, shared), estimate.ts (pure), store, Builder UI, partial leads
  lib/                 cms.ts (data layer), sound.ts, currency.ts, analytics.ts, utm.ts, scoring.ts, seo.ts
  styles/tokens.css    the one file a palette change touches
  middleware.ts        currency cookie (LKR for LK, USD otherwise) + first-touch UTM cookie
n8n/                   lead-intake workflow notes, HMAC verify node, generated scorer
supabase/cms-role.sql  cms schema + payload role with no CRM grants
```

## Decisions that differ slightly from the plan

- **Currency is static-cache friendly.** Prices render in both currencies; a tiny head
  script sets `<html data-currency>` from the cookie before paint and CSS shows one.
  Pages stay static (plan: server components read the cookie, which would make every
  priced page dynamic). The switch flips instantly without a refresh.
- **Window to page zoom** uses an overlay that grows from the window's rect while
  `router.push` runs, instead of a cross-route `layoutId` (not reliable across App
  Router navigations). Phones and reduced motion get plain navigation.
- **Case study pillars** are a select of pillar keys rather than a relationship, so
  publish hooks know which `/services/*` paths to revalidate without an extra query.
- **Estimate range width, rounding and bundle saving** live in the `pricing` global
  (Estimate settings), editable by the pricing role.
- **Aqua buttons** use Aqua Deep at the bottom of the gradient so white text passes
  contrast; Aqua itself is never used for text.
- **react-hook-form was not needed**: the builder is one question per screen, driven by
  the Zustand store and the shared zod step schemas.
- **Sound cues** are synthesised placeholders until the Bend Studios files arrive; drop
  them in `public/sounds` and list them in `CUE_FILES` in `src/lib/sound.ts`.
- **Rate limiting** is in-memory per instance (fine behind Turnstile); move to Redis if
  abuse appears across instances.

## Before launch (needs Ascendit inputs)

Seed content is placeholder (except contact details: WhatsApp, email, Instagram, LinkedIn): client names, quotes,
team names, prices, booking URL and office address in `src/seed/data.ts` (or straight into Payload). Footage
shows labelled placeholder slates until clips are uploaded. Set the env vars in
`.env.example` on Vercel, run `supabase/cms-role.sql`, and build the n8n workflow from
`n8n/README.md`.
