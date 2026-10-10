'use client'
import { LazyMotion, MotionConfig } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { useComfort } from '@/lib/comfort'

// Motion features (drag, layout) load after first paint to stay inside the
// 200 KB first-load budget. reducedMotion="user" honours the OS setting everywhere.
const features = () => import('./motion-features').then((m) => m.default)

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduce = useComfort((s) => s.reduceMotion)
  useEffect(() => {
    void useComfort.persist.rehydrate()
  }, [])
  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <LazyMotion features={features} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
