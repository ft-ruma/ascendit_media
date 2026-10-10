'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useBuilder } from '@/builder/store'
import { usePhone } from './store'

const KEY = 'ascendit-banner'

/** One social-proof banner per session, never during the builder or on the lock screen; swipe up to dismiss. */
export function Banner({ title, body, href }: { title: string; body: string; href: string }) {
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  const startY = useRef<number | null>(null)
  const [dy, setDy] = useState(0)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return
    } catch {
      return
    }
    const t = setTimeout(() => {
      const busy =
        useBuilder.getState().modalOpen ||
        usePhone.getState().controlCenter ||
        document.documentElement.hasAttribute('data-lock') ||
        location.pathname === '/start' ||
        location.pathname === href
      if (busy) return
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        // ignore
      }
      setShow(true)
    }, 14_000)
    return () => clearTimeout(t)
  }, [href])

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), 7000)
    const unsub = useBuilder.subscribe((s) => s.modalOpen && setShow(false))
    return () => {
      clearTimeout(t)
      unsub()
    }
  }, [show])

  useEffect(() => setShow(false), [pathname])

  if (!show) return null
  return (
    <div
      role="status"
      className="banner-drop fixed inset-x-3 top-[calc(env(safe-area-inset-top)+8px)] z-[70] mx-auto max-w-[420px] touch-none"
      style={{ transform: dy < 0 ? `translateY(${dy}px)` : undefined }}
      onPointerDown={(e) => (startY.current = e.clientY)}
      onPointerMove={(e) => startY.current != null && setDy(Math.min(0, e.clientY - startY.current))}
      onPointerUp={() => {
        if (dy < -30) setShow(false)
        setDy(0)
        startY.current = null
      }}
    >
      <div className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/80 p-3 shadow-lift backdrop-blur-2xl">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-ink/10 bg-tangerine font-mono text-[10px] font-semibold text-ink">WORK</span>
        <Link href={href} className="min-w-0 flex-1" onClick={() => setShow(false)}>
          <span className="block truncate text-[15px] font-semibold text-ink">{title}</span>
          <span className="block truncate text-[14px] text-ink/80">{body}</span>
        </Link>
        <button type="button" onClick={() => setShow(false)} className="grid size-11 shrink-0 place-items-center rounded-full text-graphite" aria-label="Dismiss">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>
  )
}
