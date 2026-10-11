# Ascendit OS

The ascendit.dev website: one Next.js 15 app that serves the Ascendit OS front end,
hosts Payload CMS at `/admin`, and sends every lead through n8n into the Ascendit CRM.
Built from *Ascendit OS: Implementation Plan* (Oct 9, 2026).

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000, runs on built-in seed content, no database needed
```

With the CMS and admin panel (no Docker needed):

```bash
cp .env.example .env        # set PAYLOAD_SECRET to a long random string
pnpm dev:cms                # starts a local Postgres (.local-db/) and the site
pnpm seed                   # first time only: copies the launch content into the CMS
```

Open http://localhost:3000/admin and create your account: the first account is always an
admin. (`pnpm db` runs just the database; `docker compose up -d` also works.)

Without `DATABASE_URI` every page renders from `src/seed/data.ts`. With it, pages read
Payload's local API; if the database errors, pages fall back to seed so the public
site never goes down.

## Admin panel (`/admin`)

The dashboard has quick actions, live counts (projects in progress, case studies, products,
open jobs, leads waiting in the outbox) and a one-page editor guide. What editors manage:

| Area | Where in the admin | Shows on |
| --- | --- | --- |
| Projects: case studies and work **in progress** (status, progress note, launch month), **sub-projects** (each counts toward the 100) | Content → Case Studies | /work, case pages, home Work section + "Now building", phone home |
| Every home-page headline, section title, Store to System steps, phone hero | Content → Home page | / (desktop and phone) |
| Services: copy, capabilities, process, tools, "from" prices, **render gallery** | Services → Pillars | /services/*, /photos |
| Products and plans | Products → Products | /products/*, dock, builder |
| Prices for the builder estimate | Pricing → Rate card, Estimate settings | builder, /start |
| Testimonials, team, jobs, legal pages, media | Content / Studio | /studio, /messages, /careers, /legal/* |
| WhatsApp, email, phone, socials, office, stats, founder note | Studio → Settings | menu bar, dock, footer, contact, lock screen |
| People and roles (admin, editor, pricing) | Admin → Users | |

Publishing refreshes only the affected pages, so changes are live in seconds without a deploy.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm typecheck` | TypeScript |
| `pnpm test` | Vitest: estimate, scoring, schemas, HMAC, rate limit |
| `pnpm test:e2e` | Playwright + axe, desktop and phone (`PW_CHANNEL=chrome` to use installed Chrome) |
| `pnpm size` | Fails if a public route ships over 200 KB first-load JS (run after build) |
| `pnpm dev:cms` / `pnpm db` | Local Postgres (embedded, no Docker) with or without the dev server |
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

## Ongoing & completed projects (`/projects`, home section 06, phone widget)

Every case study, completed or in progress, is a glowing node in a 3D neural brain: two
hemispheres with a folded cortex (thousands of particles, rim-lit), lobes, cerebellum and
brainstem, with signals travelling along connections and neurons firing where they land. It turns
slowly; drag to turn it. Tap a node (or pick a project from the list under it) to see the client,
services, result, progress and a link to the case study. Node colour is the service; a pulsing
ring means in progress.

**Sub-projects count.** A project's parts (Case Studies → Sub-projects, e.g. 3D design, branding,
social media marketing) are each a node and each count as one toward the universe total; a project
with no sub-projects counts as one. Parts of one project sit side by side and are linked (moons around
the project's star in the universe). The card lists the other parts; the case study page lists them
under "Project parts"; the admin dashboard shows the running total.

Growth is the point: the oldest project sits at the core and each new one connects further out.
When the count reaches the threshold (Home page → Ongoing & completed projects → "Becomes a universe at", default 100)
the brain turns into a spiral galaxy and every project becomes a star, with trails along the arms
in date order. Positions are deterministic: adding a project never moves the existing ones.

Previews (add to the URL of `/` or `/projects`): `?view=universe`, `?view=brain`, and
`?view=grow:60` to fill it with placeholder nodes and see it at 60 projects. The old `/network`
address redirects to `/projects`.

Code: `src/network/geometry.ts` (pure 3D layout, unit-tested), `ProjectNetwork.tsx` (2D canvas with its own
3D projection, additive glow and bloom, no WebGL or 3D library; animates
only while on screen, still frame under reduced motion; the project list is the keyboard and
screen-reader interface). On the home page it loads after first paint to stay inside the JS budget.

## Phone and tablet edition

Under 1024 px the site becomes a phone OS; 1024 px and up is the desktop, unchanged.

| Width | Mode |
| --- | --- |
| under 768 | Phone: status bar with the island, lock screen, home screen, frosted dock, builder as a bottom sheet |
| 768 to 1023 | Tablet: same home screen with a 6-column grid; sheets open as centred modals |
| 1024 and up | Desktop (menu bar, windows, beats) |

How it stays one site: every route renders the same server HTML at every width and CSS picks
the shell. Phone-only behaviour (gestures, Control Center, banner, app-open zoom) lives in
`src/phone/PhoneRuntime.tsx` and is loaded only when the viewport is under 1024 px, so desktop
visitors never download it. Nothing reads the user agent.

- `src/phone/`: StatusBar + Island, LockScreen (server HTML, painted with the first frame), HomeScreen
  and widgets, ServicesFolder, PhoneDock, AppNavBar (large title that collapses), BottomSheet,
  ControlCenter, Banner, MessagesThread, TypedNote, Photos (swipe, pinch to zoom)
- `src/builder/SheetBuilder.tsx`: one question per screen, pill answers, wallet-style estimate card;
  same store, schemas, estimate and `/api/lead` as the desktop builder
- New app routes: `/notes`, `/messages`, `/photos` (notes and messages are `noindex`: same content as `/studio`)
- Pre-paint flags are data attributes on `<html>` set by the head script (`data-lock`,
  `data-reduce-motion`, `data-js`), so React hydration never touches them
- Control Center settings (sound, volume, reduce motion, currency) persist in localStorage through
  `src/lib/safe-storage.ts`, which swallows storage errors

Checks: `tests/e2e/phone.spec.ts` (375/390/430 px, tablet 768/1023, 1024 desktop edge) and
`tests/visual/desktop-snap.mjs` + `tests/visual/diff.py`, which proved desktop pixel-identical before
and after (13 routes at 1024/1280/1440). Screenshots: `docs/screenshots/mobile/`.

Lighthouse (mobile, DevTools throttling: slow 4G, 4x CPU): Performance 94, LCP 2.2 s, Accessibility
100 on `/` and `/products/pos`. With Lighthouse's default simulated throttling the home page scores
82 (LCP 4.7 s), because the hidden desktop beats' JavaScript still loads on phones; splitting
those beats into a desktop-only chunk is the next performance step. CI uses DevTools throttling.

Phone copy differences (on purpose): the phone hero says "From the shop floor *to the cloud*" and
the Services folder labels read "Software & AI" and "Web & E-com"; the CMS names (desktop, SEO) are
unchanged. The client count shown everywhere comes from Settings → stats.

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
