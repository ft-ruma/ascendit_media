'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { haptic } from '@/lib/haptics'

/**
 * Phone/tablet app nav bar: "‹ Home" plus a compact title that fades in once the
 * page's large title (its h1) scrolls under the bar.
 */
export function AppNavBar() {
  const pathname = usePathname()
  const [title, setTitle] = useState('')
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>('.app-cards h1')
    if (!h1) return
    setTitle(h1.textContent?.trim() ?? '')
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting && e.boundingClientRect.top < 120), {
      rootMargin: '-100px 0px 0px 0px',
    })
    io.observe(h1)
    return () => io.disconnect()
  }, [pathname])

  return (
    <div
      className={`app-nav sticky top-[calc(48px+env(safe-area-inset-top))] z-30 -mx-3 mb-1 flex h-12 items-center px-1 transition-colors sm:-mx-4 lg:hidden ${compact ? 'border-b border-hairline bg-paper/80 backdrop-blur-xl' : ''}`}
    >
      <Link href="/" onClick={haptic} className="flex h-11 items-center gap-0.5 rounded-pill pl-1 pr-3 text-[17px] font-medium text-aqua-deep">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 5l-7 7 7 7" />
        </svg>
        Home
      </Link>
      <p aria-hidden className={`pointer-events-none absolute inset-x-24 truncate text-center text-[16px] font-semibold text-ink transition-opacity duration-200 ${compact ? 'opacity-100' : 'opacity-0'}`}>
        {title}
      </p>
    </div>
  )
}
