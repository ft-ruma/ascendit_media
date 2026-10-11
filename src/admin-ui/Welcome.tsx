import type { Payload } from 'payload'
import type React from 'react'

type Props = { payload: Payload; user?: { name?: string; email?: string; roles?: string[] } | null }

const count = async (payload: Payload, collection: string, where?: Record<string, unknown>) => {
  try {
    return (await payload.count({ collection: collection as never, where: where as never, overrideAccess: true })).totalDocs
  } catch {
    return 0
  }
}

/** Admin dashboard header: quick actions, live counts and the one-page editor guide. */
export async function Welcome({ payload, user }: Props) {
  const [building, completed, products, jobs, outbox] = await Promise.all([
    count(payload, 'case-studies', { projectStatus: { equals: 'in-progress' } }),
    count(payload, 'case-studies', { projectStatus: { equals: 'completed' } }),
    count(payload, 'products'),
    count(payload, 'careers', { open: { equals: true } }),
    count(payload, 'lead_outbox', { delivered: { equals: false } }),
  ])
  const isAdmin = user?.roles?.includes('admin')
  const site = process.env.NEXT_PUBLIC_SITE_URL || '/'

  const actions: [string, string, string][] = [
    ['Add a project', '/admin/collections/case-studies/create', 'New case study or a project in progress'],
    ['Edit the home page', '/admin/globals/home', 'Headlines, sections, Store to System'],
    ['Contact & socials', '/admin/globals/settings', 'WhatsApp, email, Instagram, LinkedIn, stats'],
    ['Update prices', '/admin/collections/rate-card', 'Builder rate card (pricing role)'],
    ['Products & plans', '/admin/collections/products', 'POS, CRM, CareSuite'],
    ['Post a job', '/admin/collections/careers/create', 'Shows on /careers'],
    ['Team', '/admin/collections/team', 'Studio page portraits'],
    ['Upload media', '/admin/collections/media/create', 'Photos, renders, video loops'],
  ]

  return (
    <div style={s.wrap}>
      <div style={s.head}>
        <div>
          <p style={s.eyebrow}>ascendit-os · dashboard</p>
          <h1 style={s.h1}>Hello{user?.name ? `, ${user.name}` : ''}. What are we updating today?</h1>
        </div>
        <a href={site} target="_blank" rel="noopener" style={s.ghost}>View site ↗</a>
      </div>

      <div style={s.stats}>
        <Stat n={building} label="projects in progress" href="/admin/collections/case-studies?where[projectStatus][equals]=in-progress" />
        <Stat n={completed} label="case studies" href="/admin/collections/case-studies" />
        <Stat n={products} label="products" href="/admin/collections/products" />
        <Stat n={jobs} label="open jobs" href="/admin/collections/careers" />
        {isAdmin && <Stat n={outbox} label="leads waiting in outbox" href="/admin/collections/lead_outbox" warn={outbox > 0} />}
      </div>

      <div style={s.grid}>
        {actions.map(([t, href, sub]) => (
          <a key={href} href={href} style={s.card}>
            <strong style={{ fontSize: 15 }}>{t}</strong>
            <span style={s.sub}>{sub}</span>
          </a>
        ))}
      </div>

      <details style={s.guide}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Editor guide (one page)</summary>
        <ol style={s.ol}>
          <li><b>Projects.</b> Case Studies holds every project. Set <i>Status</i> to <i>In progress</i> to show it under “Now building” with a progress note; switch it to <i>Completed</i> when it launches. Tick <i>Featured</i> to put it on the home page.</li>
          <li><b>Drafts and publishing.</b> Case studies and products save as drafts. Press <i>Publish</i> to go live; the affected pages refresh in seconds. Use <i>Schedule publish</i> for a launch date, and <i>Live preview</i> to see the page while you type.</li>
          <li><b>Home page.</b> Globals → Home page has every headline. In titles, press Enter where the line should break on desktop.</li>
          <li><b>Images and video.</b> Every upload needs alt text (describe what is shown). Videos need a poster frame; encode loops with <code>scripts/encode.sh</code> first (under 1.5 MB).</li>
          <li><b>Prices.</b> Only the <i>pricing</i> role can change the rate card, estimate settings and product plans. Every price is entered in both LKR and USD.</li>
          <li><b>Leads.</b> Briefs, demo requests and job applications go to the CRM through n8n, not here. If n8n is down they wait in <i>Lead outbox</i> (admins only).</li>
          <li><b>Roles.</b> Admin (developers), Editor (writes and publishes), Pricing (rate card and plans). Admins add people under Users.</li>
        </ol>
      </details>
    </div>
  )
}

function Stat({ n, label, href, warn }: { n: number; label: string; href: string; warn?: boolean }) {
  return (
    <a href={href} style={{ ...s.stat, ...(warn ? { borderColor: '#FF8A3D', background: 'rgba(255,138,61,.12)' } : {}) }}>
      <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em' }}>{n}</span>
      <span style={s.sub}>{label}</span>
    </a>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'grid', gap: 20, marginBottom: 32 },
  head: { display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  eyebrow: { fontFamily: 'ui-monospace, monospace', fontSize: 13, opacity: 0.65, margin: 0 },
  h1: { fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', margin: '6px 0 0' },
  ghost: { border: '1px solid var(--theme-elevation-150)', borderRadius: 999, padding: '8px 16px', textDecoration: 'none', color: 'inherit', fontSize: 14 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  stat: { display: 'grid', gap: 2, padding: 16, borderRadius: 14, border: '1px solid var(--theme-elevation-150)', textDecoration: 'none', color: 'inherit' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  card: { display: 'grid', gap: 4, padding: 16, borderRadius: 14, border: '1px solid var(--theme-elevation-150)', background: 'var(--theme-elevation-50)', textDecoration: 'none', color: 'inherit' },
  sub: { fontSize: 13, opacity: 0.7 },
  guide: { padding: 16, borderRadius: 14, border: '1px solid var(--theme-elevation-150)' },
  ol: { margin: '12px 0 0', paddingLeft: 20, display: 'grid', gap: 8, lineHeight: 1.55 },
}
