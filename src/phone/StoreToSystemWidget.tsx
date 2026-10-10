'use client'
import { useRef, useState } from 'react'
import type { CaseStudy } from '@/lib/types'
import { Footage } from '@/os/Footage'

const STEPS = [
  { key: 'retail', file: 'floor-plan.render', title: 'Store design', fallback: 'Layout, fixtures and photoreal renders.' },
  { key: 'software', file: 'pos-checkout.mp4', title: 'POS', fallback: 'Ascendit POS with the stock loaded on day one.' },
  { key: 'web', file: 'shop.web', title: 'Online store', fallback: 'An online store running on the same stock.' },
  { key: 'brand', file: 'launch.mov', title: 'Launch content', fallback: 'Opening-week reels, signage and ads.' },
] as const

/** One retail client's story as swipeable cards. Every card is also reachable with the step buttons. */
export function StoreToSystemWidget({ story }: { story: CaseStudy }) {
  const track = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)
  const go = (i: number) => {
    const el = track.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }
  return (
    <section aria-labelledby="s2s-widget" className="widget overflow-hidden">
      <div className="flex items-end justify-between gap-3 p-4 pb-3">
        <div>
          <p className="font-mono text-[12px] text-graphite">store-to-system</p>
          <h2 id="s2s-widget" className="text-[22px] font-medium tracking-tight text-ink">
            {story.client}: <span className="font-serif italic">floor plan to first sale</span>
          </h2>
        </div>
      </div>
      <ol
        ref={track}
        tabIndex={0}
        aria-label={`${story.client} story, swipe or use the step buttons`}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1"
        onScroll={(e) => {
          const el = e.currentTarget
          setActive(Math.round(el.scrollLeft / (el.scrollWidth / STEPS.length)))
        }}
      >
        {STEPS.map((s, i) => {
          const body = story.approach.find((a) => a.pillar === s.key)?.body ?? s.fallback
          return (
            <li key={s.key} className="w-[82%] shrink-0 snap-start overflow-hidden rounded-[18px] border border-hairline bg-paper md:w-[46%]" aria-label={`Step ${i + 1} of 4: ${s.title}`}>
              <div className="relative aspect-[16/10]">
                <Footage label={s.title} tone={i === 3 ? 'ink' : 'plaster'} />
                <span className="absolute left-2 top-2 rounded-pill bg-window/90 px-2 py-0.5 font-mono text-[11px] text-ink">{s.file}</span>
              </div>
              <div className="p-3.5">
                <p className="font-mono text-[12px] text-graphite">0{i + 1}</p>
                <h3 className="text-[17px] font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 line-clamp-3 text-[14px] leading-snug text-ink/80">{body}</p>
              </div>
            </li>
          )
        })}
      </ol>
      <div className="flex items-center justify-center gap-1 py-3" role="group" aria-label="Story steps">
        {STEPS.map((s, i) => (
          <button key={s.key} type="button" onClick={() => go(i)} aria-label={`Show ${s.title}`} aria-current={active === i ? 'step' : undefined} className="grid size-11 place-items-center">
            <span className={`block h-2 rounded-full transition-all ${active === i ? 'w-6 bg-ink' : 'w-2 bg-ink/25'}`} />
          </button>
        ))}
      </div>
    </section>
  )
}
