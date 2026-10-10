'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { haptic } from '@/lib/haptics'
import { enableSound, useSound } from '@/lib/sound'
import { prefersReducedMotion } from '@/lib/useReducedMotion'
import { useZoom } from '@/os/zoom'
import { Banner } from './Banner'
import { ControlCenter } from './ControlCenter'
import { usePhone } from './store'

type Props = { banner: { title: string; body: string; href: string } | null }

/**
 * Phone/tablet behaviour, loaded only under 1024px:
 * - app links (data-app) open with a zoom from the icon (View Transitions, Motion overlay fallback)
 * - swipe right from the left edge goes back; swipe down from the top right opens Control Center
 */
export default function PhoneRuntime({ banner }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useRef<(() => void) | null>(null)
  const [edge, setEdge] = useState(0)

  // A remembered "sound on" needs one gesture before audio can start.
  useEffect(() => {
    if (!useSound.getState().enabled) return
    const wake = () => void enableSound()
    window.addEventListener('pointerdown', wake, { once: true })
    return () => window.removeEventListener('pointerdown', wake)
  }, [])

  // Resolve the view transition once the new route has rendered.
  useEffect(() => {
    pending.current?.()
    pending.current = null
  }, [pathname])

  // Zoom from the tapped icon into the app.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-app]')
      if (!a || a.target === '_blank') return
      const url = new URL(a.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      e.preventDefault()
      haptic()
      const r = a.getBoundingClientRect()
      const href = url.pathname + url.search
      const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => unknown }
      if (prefersReducedMotion()) {
        router.push(href)
      } else if (doc.startViewTransition) {
        const root = document.documentElement
        root.style.setProperty('--vt-x', `${r.left + r.width / 2}px`)
        root.style.setProperty('--vt-y', `${r.top + r.height / 2}px`)
        root.setAttribute('data-vt', 'open')
        const t = doc.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              pending.current = () => requestAnimationFrame(() => resolve())
              router.push(href)
              setTimeout(resolve, 1500) // never hang on a slow route
            }),
        ) as { finished?: Promise<void> }
        void t.finished?.finally(() => root.removeAttribute('data-vt'))
      } else {
        useZoom.getState().start(r, href)
        router.push(href)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [router])

  // Edge swipe back + swipe down for Control Center.
  useEffect(() => {
    let sx = 0
    let sy = 0
    let mode: 'back' | 'cc' | null = null
    const start = (e: TouchEvent) => {
      const t = e.touches[0]
      sx = t.clientX
      sy = t.clientY
      mode = sx < 22 && location.pathname !== '/' ? 'back' : sy < 56 && sx > innerWidth * 0.55 ? 'cc' : null
    }
    const move = (e: TouchEvent) => {
      if (mode !== 'back') return
      const dx = e.touches[0].clientX - sx
      setEdge(Math.max(0, Math.min(dx, 120)))
    }
    const end = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - sx
      const dy = t.clientY - sy
      if (mode === 'back' && dx > 80 && Math.abs(dy) < 80) {
        haptic()
        if (history.length > 1) router.back()
        else router.push('/')
      }
      if (mode === 'cc' && dy > 50) {
        haptic()
        usePhone.getState().setControlCenter(true)
      }
      mode = null
      setEdge(0)
    }
    window.addEventListener('touchstart', start, { passive: true })
    window.addEventListener('touchmove', move, { passive: true })
    window.addEventListener('touchend', end, { passive: true })
    return () => {
      window.removeEventListener('touchstart', start)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', end)
    }
  }, [router])

  return (
    <>
      {edge > 0 && (
        <div aria-hidden className="pointer-events-none fixed left-0 top-1/2 z-[60] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink text-window shadow-window" style={{ transform: `translate(${edge / 2 - 20}px, -50%)`, opacity: Math.min(1, edge / 80) }}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M15 5l-7 7 7 7" /></svg>
        </div>
      )}
      <ControlCenter />
      {banner && <Banner {...banner} />}
    </>
  )
}
