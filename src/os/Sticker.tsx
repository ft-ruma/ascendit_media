import type { ReactNode } from 'react'
import { accentBg } from '@/lib/pillars'
import type { Accent } from '@/lib/types'

type Props = { children: ReactNode; accent?: Accent; className?: string; rotate?: number; variant?: 'tag' | 'seal' }

/** Name tags and seals. Ink text on every accent (never Aqua or Lime text). */
export function Sticker({ children, accent = 'lime', className = '', rotate = -4, variant = 'tag' }: Props) {
  if (variant === 'seal') {
    return (
      <span
        className={`grid size-24 place-items-center rounded-full border border-ink/15 ${accentBg[accent]} p-3 text-center font-mono text-[11px] font-medium uppercase leading-tight tracking-wide text-ink shadow-window ${className}`}
        style={{ rotate: `${rotate}deg` }}
      >
        {children}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border border-ink/15 ${accentBg[accent]} px-3 py-1 font-mono text-[13px] text-ink shadow-[0_6px_14px_-8px_rgb(14_14_18/.4)] ${className}`}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </span>
  )
}
