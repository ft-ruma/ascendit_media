'use client'
import { m, useInView } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { cue } from '@/lib/sound'
import type { Accent } from '@/lib/types'
import { AppIcon } from '@/os/AppIcon'

/** An app icon rises from the dock and unfolds into its window. */
export function DockLift({ glyph, accent, index, children }: { glyph: string; accent: Accent; index: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  useEffect(() => {
    if (inView && index === 0) void cue('dockLift')
  }, [inView, index])
  const delay = index * 0.12
  return (
    <div ref={ref} className="relative">
      <m.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2"
        initial={{ y: 260, opacity: 0, scale: 0.8 }}
        animate={inView ? { y: [260, -10, -10], opacity: [0, 1, 0], scale: [0.8, 1.1, 2.2] } : undefined}
        transition={{ duration: 0.9, times: [0, 0.55, 1], delay, ease: 'easeOut' }}
      >
        <AppIcon glyph={glyph} accent={accent} className="size-16 text-[18px]" />
      </m.div>
      <m.article
        className="os-window overflow-hidden rounded-window border border-hairline bg-window shadow-window"
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 220, damping: 22, delay: delay + 0.45 }}
        style={{ transformOrigin: '50% 0%' }}
      >
        {children}
      </m.article>
    </div>
  )
}
