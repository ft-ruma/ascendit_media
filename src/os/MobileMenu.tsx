'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CurrencySwitch } from './CurrencySwitch'

const LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/services/retail-design', label: 'Retail design' },
  { href: '/services/software', label: 'Software' },
  { href: '/services/web', label: 'Web' },
  { href: '/services/brand', label: 'Brand & content' },
  { href: '/products', label: 'Products' },
  { href: '/studio', label: 'Studio' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="grid size-8 place-items-center rounded-pill hover:bg-ink/5"
      >
        <span className="sr-only">Menu</span>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="fixed inset-x-3 top-14 z-50 rounded-window border border-hairline bg-window p-3 shadow-lift">
          <ul className="grid gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-lg px-3 py-2.5 text-[17px] text-ink hover:bg-paper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-hairline px-3 pt-3">
            <span className="text-[13px] text-graphite">Prices in</span>
            <CurrencySwitch />
          </div>
        </nav>
      )}
    </div>
  )
}
