import Link from 'next/link'
import { accentSoft } from '@/lib/pillars'
import type { Pillar } from '@/lib/types'
import { Doodle } from '@/os/Doodle'
import { Price } from '@/os/Price'
import { Window, type WindowPos } from '@/os/Window'
import { BeatHeader } from '../BeatHeader'

const POS: WindowPos[] = [
  { x: '0%', y: '0px', w: '48%', r: -0.6 },
  { x: '51%', y: '40px', w: '46%', r: 0.8 },
  { x: '4%', y: '340px', w: '44%', r: 0.5 },
  { x: '53%', y: '380px', w: '45%', r: -0.8 },
]

const FILE: Record<string, string> = { retail: 'retail-design.app', software: 'software.app', web: 'web.app', brand: 'brand.app' }

export function Beat2Services({ pillars }: { pillars: Pillar[] }) {
  return (
    <section aria-labelledby="beat-services" className="relative mx-auto mt-24 max-w-[1536px] px-4 lg:mt-10 lg:px-6">
      <BeatHeader n={2} id="beat-services" eyebrow="Services" title={<>Four pillars,<br />one studio.</>}>
        Most shops hire four companies to open one store. We are all four, so the render, the till, the website and the launch reel all agree.
      </BeatHeader>
      <div className="relative grid gap-4 sm:grid-cols-2 lg:block lg:h-[700px]">
        {pillars.map((p, i) => (
          <Window key={p.key} title={FILE[p.key] ?? `${p.slug}.app`} href={`/services/${p.slug}`} accent={p.accent} pos={POS[i]} delay={i * 0.08} bodyClassName="p-0">
            <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-[26px] font-semibold tracking-tight text-ink">{p.name}</h3>
                <p className="mt-1.5 max-w-[38ch] text-[16px] text-ink/80">{p.oneLiner}</p>
              </div>
              <p className="text-[13px] text-graphite sm:text-right">
                from
                <Price lkr={p.fromPriceLKR} usd={p.fromPriceUSD} className="block text-[17px] font-medium text-ink" />
              </p>
            </div>
            <ul className={`flex flex-wrap gap-1.5 border-t border-hairline px-6 py-4 ${accentSoft[p.accent]}`}>
              {p.capabilities.slice(0, 4).map((c) => (
                <li key={c} className="rounded-pill border border-ink/10 bg-window/80 px-2.5 py-1 text-[13px] text-ink">{c}</li>
              ))}
            </ul>
            <Link href={`/services/${p.slug}`} className="flex items-center justify-between border-t border-hairline px-6 py-3 text-[14px] font-medium text-ink hover:bg-paper">
              Open {p.name.toLowerCase()} <span aria-hidden>→</span>
            </Link>
          </Window>
        ))}
        <Doodle shape="circle" className="absolute left-[38%] top-[300px] hidden w-56 text-lilac lg:block" />
      </div>
    </section>
  )
}
