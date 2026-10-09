'use client'
import { useEffect, useState } from 'react'
import { disableSound, enableSound, useSound } from '@/lib/sound'
import { useReducedMotion } from '@/lib/useReducedMotion'

export function SoundToggle() {
  const enabled = useSound((s) => s.enabled)
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // A remembered "on" needs a fresh user gesture before audio may start.
  useEffect(() => {
    if (!enabled) return
    const wake = () => void enableSound()
    window.addEventListener('pointerdown', wake, { once: true })
    return () => window.removeEventListener('pointerdown', wake)
  }, [enabled])

  const on = mounted && enabled && !reduced
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={reduced}
      title={reduced ? 'Sound is off while reduced motion is on' : on ? 'Sound on' : 'Sound off'}
      onClick={() => (on ? disableSound() : void enableSound())}
      className="grid size-8 place-items-center rounded-pill text-ink transition hover:bg-ink/5 disabled:opacity-40"
    >
      <span className="sr-only">Sound {on ? 'on' : 'off'}</span>
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
        <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? (
          <>
            <path d="M16 9.5a3.5 3.5 0 0 1 0 5" />
            <path d="M18.5 7a7 7 0 0 1 0 10" />
          </>
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" />
        )}
      </svg>
    </button>
  )
}
