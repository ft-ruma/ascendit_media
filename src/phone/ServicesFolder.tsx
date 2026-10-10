'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { haptic } from '@/lib/haptics'
import { glyph, tiles } from './AppTile'

// Phone labels per the mobile brief; the CMS names (desktop, SEO) are unchanged.
const SERVICES = [
  { key: 'retail', href: '/services/retail-design', label: 'Retail Design' },
  { key: 'software', href: '/services/software', label: 'Software & AI' },
  { key: 'web', href: '/services/web', label: 'Web & E-com' },
  { key: 'brand', href: '/services/brand', label: 'Brand & Content' },
] as const

/** The four services in a folder that opens like a phone folder. */
export function ServicesFolder() {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLElement>('a')?.focus()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      btn.current?.focus()
    }
  }, [open])

  return (
    <>
      <button ref={btn} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => { haptic(); setOpen(true) }} className="group flex flex-col items-center gap-1.5 rounded-[18px]">
        <span className="grid size-[62px] grid-cols-2 gap-1 rounded-[18px] border border-ink/10 bg-white/60 p-2 shadow-[inset_0_1px_0_white,0_8px_16px_-10px_rgb(14_14_18/.45)] backdrop-blur transition group-active:scale-90">
          {SERVICES.map((s) => <span key={s.key} aria-hidden className={`rounded-[6px] border border-ink/10 ${tiles[s.key]}`} />)}
        </span>
        <span className="text-[12px] font-medium leading-tight text-ink">Services</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-paper/40 px-6 backdrop-blur-2xl" onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="folder-title" className="folder-pop w-full max-w-[340px]">
            <h2 id="folder-title" className="mb-4 text-center text-[28px] font-medium tracking-tight text-ink">Services</h2>
            <ul className="grid grid-cols-2 gap-6 rounded-[34px] border border-white/70 bg-white/60 p-6 shadow-lift">
              {SERVICES.map((s) => (
                <li key={s.key}>
                  <Link href={s.href} data-app onClick={() => setOpen(false)} className="flex flex-col items-center gap-2 rounded-[18px]">
                    <span className={`grid size-[70px] place-items-center rounded-[20px] border border-ink/10 shadow-[inset_0_1px_0_rgb(255_255_255/.65),0_8px_16px_-10px_rgb(14_14_18/.45)] ${tiles[s.key]}`} aria-hidden>
                      {glyph[s.key]}
                    </span>
                    <span className="text-center text-[13px] font-medium text-ink">{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setOpen(false)} className="mx-auto mt-5 block h-11 rounded-pill px-6 text-[15px] font-medium text-ink">Close</button>
          </div>
        </div>
      )}
    </>
  )
}
