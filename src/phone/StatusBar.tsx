'use client'
import { useEffect, useState } from 'react'
import { haptic } from '@/lib/haptics'
import { Island } from './Island'
import { usePhone } from './store'

const time = new Intl.DateTimeFormat('en-LK', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: false })

/** Phone/tablet status bar: Colombo time, the island, decorative signal glyphs (which open Control Center). */
export function StatusBar({ open }: { open: boolean }) {
  const [now, setNow] = useState<string | null>(null)
  const setCC = usePhone((s) => s.setControlCenter)
  useEffect(() => {
    const tick = () => setNow(time.format(new Date()))
    tick()
    const t = setInterval(tick, 15_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="status-bar sticky top-0 z-50 border-b border-hairline/70 bg-paper/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
      <div className="relative mx-auto flex h-12 max-w-[1023px] items-center justify-between px-5">
        <span className="w-16 font-mono text-[15px] font-medium tabular-nums text-ink" aria-label="Time in Colombo" suppressHydrationWarning>
          {now ?? ' '}
        </span>
        <Island open={open} />
        <button
          type="button"
          onClick={() => {
            haptic()
            setCC(true)
          }}
          aria-label="Open Control Center: sound, motion and currency"
          className="-mr-2 flex h-11 w-16 items-center justify-end gap-1.5 rounded-pill pr-2 text-ink"
        >
          <svg viewBox="0 0 18 12" className="h-3 w-[18px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 4.6} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="1" fill="currentColor" />)}
          </svg>
          <svg viewBox="0 0 16 12" className="h-3 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M1.5 4.5a9.5 9.5 0 0 1 13 0M4 7a6 6 0 0 1 8 0" />
            <circle cx="8" cy="9.8" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          <svg viewBox="0 0 27 13" className="h-3 w-[26px]" aria-hidden>
            <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4" />
            <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
            <path d="M25 4.5v4a2 2 0 0 0 0-4z" fill="currentColor" opacity=".4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
