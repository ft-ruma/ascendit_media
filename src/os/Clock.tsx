'use client'
import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('en-LK', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: false })
const day = new Intl.DateTimeFormat('en-LK', { timeZone: 'Asia/Colombo', weekday: 'short' })

/** Colombo time. Client-only so the static HTML never shows a stale time. */
export function Clock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="font-mono text-[13px] tabular-nums text-ink" aria-label="Time in Colombo" suppressHydrationWarning>
      {now ? `${day.format(now)} ${fmt.format(now)}` : ' '}
      <span className="text-graphite"> Colombo</span>
    </span>
  )
}
