'use client'
import { m } from 'motion/react'

const SHAPES = {
  circle: { viewBox: '0 0 220 90', d: 'M30 52C24 24 92 8 150 14c48 5 66 26 52 44-18 24-104 30-150 18C24 69 10 52 38 38 70 22 132 18 178 26' },
  arrow: { viewBox: '0 0 120 80', d: 'M8 12c26 4 58 18 76 44m0 0-2-22m2 22-22-4' },
  underline: { viewBox: '0 0 200 20', d: 'M4 12c40-8 92-10 192-2' },
  squiggle: { viewBox: '0 0 140 30', d: 'M4 18c12-14 20 12 32 0s20-14 32 0 20 12 32 0 20-14 32 0' },
  star: { viewBox: '0 0 60 60', d: 'M30 6l5 17 18 1-14 11 5 17-14-10-14 10 5-17L7 24l18-1z' },
} as const

/** Hand-drawn marks that draw on when they scroll into view. */
export function Doodle({ shape, className = '', color = 'currentColor', delay = 0.2 }: { shape: keyof typeof SHAPES; className?: string; color?: string; delay?: number }) {
  const s = SHAPES[shape]
  return (
    <svg viewBox={s.viewBox} className={`pointer-events-none overflow-visible ${className}`} fill="none" aria-hidden>
      <m.path
        d={s.d}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut', delay }}
      />
    </svg>
  )
}
