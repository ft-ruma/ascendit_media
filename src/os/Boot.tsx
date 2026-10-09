'use client'
import { useEffect, useRef, useState } from 'react'
import { cue } from '@/lib/sound'
import { prefersReducedMotion } from '@/lib/useReducedMotion'
import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from './wordmark-paths'

const KEY = 'ascendit-booted'

/** Wordmark draws in on Paper, under 1.5 s, skippable, once per visit. Skipped under reduced motion. */
export function Boot() {
  const [show, setShow] = useState(false)
  const svg = useRef<SVGSVGElement>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const uncover = () => document.documentElement.classList.remove('booting')
    try {
      if (sessionStorage.getItem(KEY) || prefersReducedMotion()) return uncover()
      sessionStorage.setItem(KEY, '1')
    } catch {
      return uncover()
    }
    setShow(true)
    // Our own overlay is now up; drop the CSS cover the head script added.
    requestAnimationFrame(uncover)
  }, [])

  useEffect(() => {
    if (!show || !svg.current) return
    let killed = false
    let tl: { kill: () => void } | null = null
    void import('gsap').then(({ gsap }) => {
      if (killed || !svg.current) return
      const paths = Array.from(svg.current.querySelectorAll('path'))
      paths.forEach((p) => {
        const len = p.getTotalLength()
        p.style.strokeDasharray = `${len}`
        p.style.strokeDashoffset = `${len}`
      })
      void cue('boot')
      tl = gsap
        .timeline({ onComplete: () => setShow(false) })
        .to(paths, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut', stagger: 0.08 })
        .to(paths, { fillOpacity: 1, duration: 0.25 }, '-=0.25')
        .to(root.current, { opacity: 0, duration: 0.3, ease: 'power1.out' }, '+=0.1')
    })
    const skip = () => setShow(false)
    window.addEventListener('keydown', skip, { once: true })
    return () => {
      killed = true
      tl?.kill()
      window.removeEventListener('keydown', skip)
    }
  }, [show])

  if (!show) return null
  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] grid place-items-center bg-paper"
      onClick={() => setShow(false)}
      role="presentation"
    >
      <svg ref={svg} viewBox={WORDMARK_VIEWBOX} className="w-[min(70vw,520px)]" aria-label="Ascendit">
        {Object.values(WORDMARK_PATHS).map((d, i) => (
          <path key={i} d={d} fill="#0E0E12" fillOpacity={0} stroke="#0E0E12" strokeWidth={3} fillRule="evenodd" />
        ))}
      </svg>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="absolute bottom-8 font-mono text-[13px] text-graphite underline-offset-4 hover:underline"
      >
        Skip
      </button>
    </div>
  )
}
