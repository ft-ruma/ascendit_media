'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/useReducedMotion'
import { isDesktop } from '@/os/zoom'

/** GSAP ScrollTrigger pin, desktop only, loaded on demand. Without JS or under reduced motion the row is simply visible. */
export function StoreToSystemPin({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || !isDesktop() || prefersReducedMotion()) return
    let ctx: { revert: () => void } | undefined
    let cancelled = false
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !ref.current) return
      gsap.registerPlugin(ScrollTrigger)
      ctx = gsap.context(() => {
        const wins = gsap.utils.toArray<HTMLElement>('[data-s2s-window]')
        gsap
          .timeline({
            scrollTrigger: { trigger: ref.current, start: 'top 64px', end: '+=1400', pin: true, scrub: 0.6 },
          })
          .from(wins, { opacity: 0, y: 80, scale: 0.86, rotate: (i) => (i % 2 ? 3 : -3), stagger: 0.5, ease: 'back.out(1.4)' })
      }, ref)
    })
    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [])
  return <div ref={ref} className="lg:pt-6">{children}</div>
}
