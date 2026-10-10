'use client'
import { useEffect, useRef } from 'react'
import { useComfort } from '@/lib/comfort'
import { useCurrency } from '@/lib/currency'
import { haptic } from '@/lib/haptics'
import { disableSound, enableSound, MAX_VOLUME, useSound } from '@/lib/sound'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { usePhone } from './store'

/** Sound, volume, reduce motion and currency. Everything persists via the existing stores. */
export function ControlCenter() {
  const open = usePhone((s) => s.controlCenter)
  const setOpen = usePhone((s) => s.setControlCenter)
  const { enabled, volume, setVolume } = useSound()
  const reduceSite = useComfort((s) => s.reduceMotion)
  const setReduce = useComfort((s) => s.setReduceMotion)
  const reduced = useReducedMotion()
  const { currency, setCurrency } = useCurrency()
  const panel = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      prev?.focus?.()
    }
  }, [open, setOpen])

  if (!open) return null
  const soundOn = enabled && !reduced

  return (
    <div className="fixed inset-0 z-[85] bg-ink/20 backdrop-blur-[6px]" onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Control Center"
        tabIndex={-1}
        className="cc-drop mx-auto mt-[calc(env(safe-area-inset-top)+10px)] w-[min(94vw,420px)] rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-lift outline-none backdrop-blur-2xl backdrop-saturate-150"
        onPointerDown={(e) => (startY.current = e.clientY)}
        onPointerUp={(e) => {
          if (startY.current != null && startY.current - e.clientY > 60) setOpen(false) // swipe up to close
          startY.current = null
        }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="font-mono text-[13px] text-ink">control-center</p>
          <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full text-ink hover:bg-ink/5" aria-label="Close Control Center">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Tile
            on={soundOn}
            disabled={reduced}
            label="Sound"
            sub={reduced ? 'Off with reduce motion' : soundOn ? 'On' : 'Off'}
            onClick={() => {
              haptic()
              if (soundOn) disableSound()
              else void enableSound()
            }}
            icon={<path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />}
          />
          <Tile
            on={reduceSite}
            label="Reduce motion"
            sub={reduceSite ? 'Fades only' : 'Off'}
            onClick={() => {
              haptic()
              setReduce(!reduceSite)
              if (!reduceSite) disableSound()
            }}
            icon={<path d="M4 12h4l2-5 4 10 2-5h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
          />
          <div className="col-span-2 rounded-[22px] bg-window/80 p-4">
            <label htmlFor="cc-volume" className="mb-2 flex items-center justify-between text-[15px] font-medium text-ink">
              Volume <span className="font-mono text-[13px] text-graphite">{Math.round((volume / MAX_VOLUME) * 100)}%</span>
            </label>
            <input
              id="cc-volume"
              type="range"
              min={0}
              max={MAX_VOLUME}
              step={0.05}
              value={volume}
              disabled={!soundOn}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="cc-range h-11 w-full accent-[var(--color-aqua-deep)] disabled:opacity-40"
            />
          </div>
          <div role="group" aria-label="Currency" className="col-span-2 flex items-center justify-between rounded-[22px] bg-window/80 p-2 pl-4">
            <span className="text-[15px] font-medium text-ink">Prices in</span>
            <span className="flex gap-1">
              {(['LKR', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={currency === c}
                  onClick={() => { haptic(); setCurrency(c) }}
                  className={`h-11 min-w-16 rounded-pill px-4 font-mono text-[14px] ${currency === c ? 'bg-ink text-window' : 'text-ink'}`}
                >
                  {c}
                </button>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tile({ on, label, sub, onClick, icon, disabled }: { on: boolean; label: string; sub: string; onClick: () => void; icon: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[96px] flex-col items-start justify-between rounded-[22px] p-4 text-left transition disabled:opacity-50 ${on ? 'bg-aqua-deep text-white' : 'bg-window/80 text-ink'}`}
    >
      <span className={`grid size-9 place-items-center rounded-full ${on ? 'bg-white/20' : 'bg-ink/5'}`}>
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>{icon}</svg>
      </span>
      <span>
        <span className="block text-[15px] font-semibold">{label}</span>
        <span className={`block text-[13px] ${on ? 'text-white/85' : 'text-graphite'}`}>{sub}</span>
      </span>
    </button>
  )
}
