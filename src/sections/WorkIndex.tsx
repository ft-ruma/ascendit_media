'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PILLAR_NAMES } from '@/lib/pillars'
import type { CaseStudy, PillarKey } from '@/lib/types'
import { CaseGrid } from './CaseGrid'

export function WorkIndex({ cases, industries }: { cases: CaseStudy[]; industries: string[] }) {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const service = sp.get('service')
  const industry = sp.get('industry')
  const where = sp.get('where')

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(sp)
    if (v) next.set(k, v)
    else next.delete(k)
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false })
  }

  const list = cases.filter(
    (c) => (!service || c.pillars.includes(service as PillarKey)) && (!industry || c.industry === industry) && (!where || c.location === where),
  )

  return (
    <>
      <div className="mb-8 grid gap-3" role="group" aria-label="Filter work">
        <FilterRow label="Service" value={service} onChange={(v) => set('service', v)} options={(Object.keys(PILLAR_NAMES) as PillarKey[]).map((k) => [k, PILLAR_NAMES[k]])} />
        <FilterRow label="Industry" value={industry} onChange={(v) => set('industry', v)} options={industries.map((i) => [i, i])} />
        <FilterRow label="Where" value={where} onChange={(v) => set('where', v)} options={[['LK', 'Sri Lanka'], ['intl', 'International']]} />
      </div>
      <p className="sr-only" aria-live="polite">{list.length} case studies</p>
      {list.length ? <CaseGrid cases={list} /> : <p className="py-16 text-center text-[17px] text-graphite">Nothing matches yet. Try fewer filters.</p>}
    </>
  )
}

function FilterRow({ label, value, options, onChange }: { label: string; value: string | null; options: [string, string][]; onChange: (v: string | null) => void }) {
  const chip = (active: boolean) => `shrink-0 rounded-pill border px-3 py-1.5 text-[14px] transition ${active ? 'border-ink bg-ink text-window' : 'border-hairline bg-window text-ink hover:border-ink/30'}`
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <span className="eyebrow w-20 shrink-0">{label}</span>
      <button type="button" aria-pressed={!value} className={chip(!value)} onClick={() => onChange(null)}>All</button>
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={value === v} className={chip(value === v)} onClick={() => onChange(value === v ? null : v)}>{l}</button>
      ))}
    </div>
  )
}
