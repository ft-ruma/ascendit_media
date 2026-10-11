import Link from 'next/link'
import { PILLAR_NAMES } from '@/lib/pillars'
import type { CaseStudy } from '@/lib/types'

const month = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : null)

/** In-progress projects ("status: in progress" in the CMS). Renders nothing when there are none. */
export function NowBuilding({ projects, title, intro, variant = 'desktop' }: { projects: CaseStudy[]; title: string; intro: string; variant?: 'desktop' | 'phone' }) {
  if (!projects.length) return null
  return (
    <section aria-labelledby={`now-building-${variant}`} className={variant === 'phone' ? 'widget p-4' : 'mt-10 rounded-window border border-hairline bg-window p-6 shadow-window'}>
      <div className="mb-4 flex items-center gap-3">
        <span className="relative flex size-2.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-tangerine opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2.5 rounded-full bg-tangerine" />
        </span>
        <h2 id={`now-building-${variant}`} className={variant === 'phone' ? 'text-[20px] font-medium tracking-tight text-ink' : 'text-[22px] font-semibold tracking-tight text-ink'}>{title}</h2>
        <p className="font-mono text-[13px] text-graphite">{intro}</p>
      </div>
      <ul className={`grid gap-3 ${variant === 'phone' ? '' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={`/work/${p.slug}`} className="group grid gap-1 rounded-2xl border border-hairline bg-paper p-4 transition hover:border-ink/25">
              <span className="font-mono text-[12px] text-graphite">{p.windowFileName}</span>
              <span className="text-[17px] font-semibold text-ink group-hover:underline underline-offset-4">{p.client}</span>
              <span className="text-[14px] text-ink/80">{p.progress || p.result}</span>
              <span className="mt-1 text-[13px] text-graphite">
                {p.pillars.map((x) => PILLAR_NAMES[x]).join(' · ')}
                {month(p.expectedLaunch) ? ` · launching ${month(p.expectedLaunch)}` : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
