'use client'
import { useEffect } from 'react'
import { cue } from '@/lib/sound'

const KEY = 'ascendit-unlocked'

/** Swipe up or tap to unlock, auto-unlock after 2 s, never again this session. */
export function LockController() {
  useEffect(() => {
    const html = document.documentElement
    if (!html.hasAttribute('data-lock')) return
    const el = document.querySelector<HTMLElement>('.lockscreen')
    if (!el) return
    let done = false
    let startY: number | null = null

    const unlock = () => {
      if (done) return
      done = true
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        // ignore
      }
      void cue('boot') // silent unless sound was already on
      html.setAttribute('data-unlocking', '')
      setTimeout(() => {
        html.removeAttribute('data-lock')
        html.removeAttribute('data-unlocking')
      }, 380)
    }

    const auto = setTimeout(unlock, 2000)
    const down = (e: PointerEvent) => (startY = e.clientY)
    const up = (e: PointerEvent) => {
      if (startY == null) return
      const dy = startY - e.clientY
      startY = null
      if (dy > 40 || Math.abs(dy) < 8) unlock() // swipe up, or a tap
    }
    const key = (e: KeyboardEvent) => ['Enter', ' ', 'Escape', 'ArrowUp'].includes(e.key) && unlock()
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerup', up)
    window.addEventListener('keydown', key)
    el.querySelector<HTMLButtonElement>('[data-unlock]')?.addEventListener('click', unlock)
    return () => {
      clearTimeout(auto)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerup', up)
      window.removeEventListener('keydown', key)
    }
  }, [])
  return null
}
