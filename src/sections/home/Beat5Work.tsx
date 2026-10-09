import Link from 'next/link'
import { PILLAR_NAMES } from '@/lib/pillars'
import type { CaseStudy } from '@/lib/types'
import { LoopVideo } from '@/os/LoopVideo'
import { Sticker } from '@/os/Sticker'
import { Window, type WindowPos } from '@/os/Window'
import { BeatHeader } from '../BeatHeader'

const POS: WindowPos[] = [
  { x: '0%', y: '0px', w: '50%', r: -0.5 },
  { x: '54%', y: '70px', w: '42%', r: 1 },
  { x: '22%', y: '700px', w: '46%', r: -0.8 },
]

export function Beat5Work({ cases }: { cases: CaseStudy[] }) {
  return (
    <section aria-labelledby="beat-work" className="relative mx-auto mt-24 max-w-[1536px] px-4 lg:mt-32 lg:px-6">
      <BeatHeader n={5} id="beat-work" eyebrow="Work" title={<>Stores open.<br />Tills ringing.</>} />
      <div className="relative grid gap-4 md:grid-cols-2 lg:block lg:h-[1330px]">
        {cases.slice(0, 3).map((c, i) => (
          <Window key={c.slug} title={c.windowFileName} href={`/work/${c.slug}`} pos={POS[i]} delay={i * 0.1} bodyClassName="p-0">
            <div className="aspect-[16/10] overflow-hidden">
              <LoopVideo video={c.video ?? c.cover} label={`${c.client}: ${c.industry}`} />
            </div>
            <div className="grid gap-3 p-6">
              <div className="flex flex-wrap items-center gap-2">
                {c.pillars.map((p) => (
                  <span key={p} className="rounded-pill border border-hairline px-2.5 py-0.5 text-[13px] text-ink">{PILLAR_NAMES[p]}</span>
                ))}
                <span className="ml-auto font-mono text-[13px] text-graphite">{c.location === 'LK' ? 'Sri Lanka' : 'International'}</span>
              </div>
              <h3 className="text-[22px] font-semibold tracking-tight text-ink">{c.client}</h3>
              <p className="text-[16px] text-ink/80">{c.result}</p>
              {c.metrics.length > 0 && (
                <dl className="mt-1 flex flex-wrap gap-6 border-t border-hairline pt-4">
                  {c.metrics.slice(0, 3).map((m) => (
                    <div key={m.label}>
                      <dt className="text-[13px] text-graphite">{m.label}</dt>
                      <dd className="text-[24px] font-semibold tracking-tight text-ink tabular-nums">
                        {m.value}<span className="ml-0.5 text-[15px] font-medium">{m.unit}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </Window>
        ))}
        <Sticker accent="tangerine" rotate={6} className="absolute right-[10%] top-[800px] hidden lg:inline-flex">
          <Link href="/work">All work →</Link>
        </Sticker>
      </div>
    </section>
  )
}
