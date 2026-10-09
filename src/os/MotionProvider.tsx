'use client'
import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

// Motion features (drag, layout) load after first paint to stay inside the
// 200 KB first-load budget. reducedMotion="user" honours the OS setting everywhere.
const features = () => import('./motion-features').then((m) => m.default)

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={features} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
