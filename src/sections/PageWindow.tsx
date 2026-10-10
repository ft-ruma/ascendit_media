import Link from 'next/link'
import type { ReactNode } from 'react'
import { accentBg } from '@/lib/pillars'
import type { Accent } from '@/lib/types'
import { AppNavBar } from '@/phone/AppNavBar'

/** Every page is a window opened full size: same chrome as the desktop, server-rendered, no motion needed. */
export function PageWindow({
  file, crumbs = [], accent, children, wide = false,
}: { file: string; crumbs?: { label: string; href: string }[]; accent?: Accent; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto px-3 pt-4 sm:px-4 lg:px-6 lg:pt-6 ${wide ? 'max-w-[1536px]' : 'max-w-[1280px]'} max-lg:max-w-[860px] max-lg:pt-0`}>
      {/* Under 1024px the window becomes an app view: nav bar + stacked 22px cards (styles in globals.css). */}
      <AppNavBar />
      <div className="page-window app-cards overflow-hidden rounded-window border border-hairline bg-window shadow-window">
        <div className="titlebar relative flex h-10 items-center gap-1.5 border-b border-hairline bg-gradient-to-b from-white to-paper/60 px-3">
          <Link href="/" aria-label="Close and go to the desktop" className={`size-3 rounded-full border border-ink/10 ${accent ? accentBg[accent] : 'bg-tangerine'}`} />
          <span aria-hidden className="size-3 rounded-full border border-ink/10 bg-ink/10" />
          <span aria-hidden className="size-3 rounded-full border border-ink/10 bg-aqua" />
          <nav aria-label="Breadcrumb" className="absolute inset-x-20 truncate text-center font-mono text-[13px] text-graphite">
            <Link href="/" className="hover:text-ink">~</Link>
            {crumbs.map((c) => (
              <span key={c.href}> / <Link href={c.href} className="hover:text-ink">{c.label}</Link></span>
            ))}
            <span className="text-ink"> / {file}</span>
          </nav>
        </div>
        {children}
      </div>
    </div>
  )
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="grid gap-5 border-b border-hairline px-6 py-12 sm:px-10 lg:py-16">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display max-w-[18ch] text-[46px] text-ink sm:text-[64px] lg:text-[80px]">{title}</h1>
      {intro && <p className="max-w-[60ch] text-[18px] leading-relaxed text-ink/85">{intro}</p>}
      {children}
    </header>
  )
}
