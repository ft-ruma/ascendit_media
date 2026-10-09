import Link from 'next/link'
import { PILLAR_NAMES } from '@/lib/pillars'
import type { CaseStudy } from '@/lib/types'
import { LoopVideo } from '@/os/LoopVideo'

export function CaseGrid({ cases }: { cases: CaseStudy[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cases.map((c) => (
        <li key={c.slug}>
          <Link href={`/work/${c.slug}`} className="group block overflow-hidden rounded-window border border-hairline bg-window shadow-window transition hover:-translate-y-0.5">
            <div className="flex h-9 items-center justify-center border-b border-hairline bg-paper font-mono text-[13px] text-graphite">{c.windowFileName}</div>
            <div className="aspect-[16/10]"><LoopVideo video={c.cover} label={`${c.client}: ${c.industry}`} /></div>
            <div className="grid gap-2 p-5">
              <p className="text-[13px] text-graphite">{c.pillars.map((p) => PILLAR_NAMES[p]).join(' · ')} · {c.location === 'LK' ? 'Sri Lanka' : 'International'}</p>
              <h3 className="text-[20px] font-semibold tracking-tight text-ink group-hover:underline underline-offset-4">{c.client}</h3>
              <p className="text-[15px] text-ink/80">{c.result}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
