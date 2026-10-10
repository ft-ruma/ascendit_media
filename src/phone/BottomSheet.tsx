'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { haptic } from '@/lib/haptics'

type Detent = 'medium' | 'full'
const HEIGHT: Record<Detent, string> = { medium: '64svh', full: 'calc(100svh - env(safe-area-inset-top) - 12px)' }

/**
 * Bottom sheet with two detents (medium, full), a grabber, and drag to dismiss.
 * Dragging the grabber up goes to full; down goes to medium, then closes.
 */
export function BottomSheet({
  label, onClose, children, initial = 'medium',
}: { label: string; onClose: () => void; children: ReactNode; initial?: Detent }) {
  const [detent, setDetent] = useState<Detent>(initial)
  const [drag, setDrag] = useState(0)
  const [closing, setClosing] = useState(false)
  const start = useRef<{ y: number; t: number } | null>(null)
  const sheet = useRef<HTMLDivElement>(null)

  const close = () => {
    setClosing(true)
    setTimeout(onClose, 220)
  }

  useEffect(() => {
    requestAnimationFrame(() => sheet.current?.focus())
  }, [])

  const onDown = (e: React.PointerEvent) => {
    start.current = { y: e.clientY, t: performance.now() }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return
    setDrag(e.clientY - start.current.y)
  }
  const onUp = (e: React.PointerEvent) => {
    if (!start.current) return
    const dy = e.clientY - start.current.y
    const v = dy / Math.max(1, performance.now() - start.current.t) // px per ms
    start.current = null
    setDrag(0)
    if (Math.abs(dy) < 6) return setDetent((d) => (d === 'medium' ? 'full' : 'medium')) // tap the grabber to toggle
    haptic()
    if (dy < -50 || v < -0.6) setDetent('full')
    else if (dy > 90 || v > 0.6) {
      if (detent === 'full' && dy < 260) setDetent('medium')
      else close()
    }
  }

  return (
    <div className={`fixed inset-0 z-[80] flex items-end bg-ink/25 transition-opacity duration-200 ${closing ? 'opacity-0' : ''}`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`sheet-up flex w-full flex-col overflow-hidden rounded-t-[28px] border border-hairline bg-window shadow-lift outline-none ${closing ? 'translate-y-full' : ''}`}
        style={{
          height: HEIGHT[detent],
          transform: drag ? `translateY(${Math.max(drag, -40)}px)` : undefined,
          transition: drag ? 'none' : 'height .32s cubic-bezier(.2,.9,.3,1), transform .25s cubic-bezier(.2,.9,.3,1)',
        }}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none flex-col items-center pb-1 pt-2"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => { start.current = null; setDrag(0) }}
        >
          <button
            type="button"
            aria-label={detent === 'medium' ? 'Expand sheet' : 'Shrink sheet'}
            className="-my-2.5 grid h-11 w-28 place-items-center"
            onClick={(e) => e.detail === 0 && setDetent((d) => (d === 'medium' ? 'full' : 'medium'))}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') setDetent('full')
              if (e.key === 'ArrowDown') setDetent('medium')
            }}
          >
            <span aria-hidden className="block h-[5px] w-10 rounded-full bg-ink/20" />
          </button>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
