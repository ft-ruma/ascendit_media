'use client'
import { useEffect, useRef, useState } from 'react'
import { haptic } from '@/lib/haptics'
import { Footage } from '@/os/Footage'

export type Photo = { src?: string; alt: string; caption: string }

/** Photos app: grid, tap for full screen, swipe between images, pinch to zoom (pointer events, so Android Chrome too). */
export function Photos({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <>
      <ul className="grid grid-cols-3 gap-1 md:grid-cols-4">
        {photos.map((p, i) => (
          <li key={i}>
            <button type="button" onClick={() => { haptic(); setOpen(i) }} className="block aspect-square w-full overflow-hidden rounded-[6px]" aria-label={`Open ${p.caption}`}>
              {p.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.src} alt={p.alt} loading="lazy" className="size-full object-cover" />
              ) : (
                <Footage label={p.alt} tone={i % 3 === 1 ? 'paper' : 'plaster'} className="min-h-0!" compact />
              )}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Viewer photos={photos} start={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function Viewer({ photos, start, onClose }: { photos: Photo[]; start: number; onClose: () => void }) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(start)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    track.current?.children[start]?.scrollIntoView({ inline: 'start', block: 'nearest' })
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') scrollTo(index + 1)
      if (e.key === 'ArrowLeft') scrollTo(index - 1)
    }
    window.addEventListener('keydown', key)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', key)
      document.documentElement.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const scrollTo = (i: number) => {
    const n = Math.max(0, Math.min(photos.length - 1, i))
    track.current?.children[n]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-[90] flex flex-col bg-ink text-window">
      <div className="flex shrink-0 items-center justify-between px-3 pt-[calc(env(safe-area-inset-top)+6px)]">
        <button type="button" onClick={onClose} className="h-11 rounded-pill px-4 text-[16px] font-medium">Done</button>
        <span className="font-mono text-[13px]">{index + 1} of {photos.length}</span>
        <span className="w-16" />
      </div>
      <div
        ref={track}
        tabIndex={0}
        aria-label="Photos, swipe or use the arrow keys"
        className={`no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory ${zoomed ? 'overflow-hidden' : 'overflow-x-auto'}`}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {photos.map((p, i) => (
          <figure key={i} className="flex w-full shrink-0 snap-center flex-col items-center justify-center gap-3 p-4">
            <Zoomable onZoom={setZoomed} active={i === index}>
              {p.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.src} alt={p.alt} className="max-h-[70svh] w-auto max-w-full rounded-lg object-contain" draggable={false} />
              ) : (
                <div className="aspect-[4/5] w-[min(86vw,520px)] overflow-hidden rounded-lg"><Footage label={p.caption} /></div>
              )}
            </Zoomable>
            <figcaption className="font-mono text-[13px] text-window/80">{p.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="flex shrink-0 justify-center gap-6 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
        <button type="button" onClick={() => scrollTo(index - 1)} disabled={index === 0} className="h-11 rounded-pill px-5 disabled:opacity-30" aria-label="Previous photo">‹ Prev</button>
        <button type="button" onClick={() => scrollTo(index + 1)} disabled={index === photos.length - 1} className="h-11 rounded-pill px-5 disabled:opacity-30" aria-label="Next photo">Next ›</button>
      </div>
    </div>
  )
}

/** Two-finger pinch to zoom (1x to 4x), drag to pan while zoomed, double-tap to toggle. */
function Zoomable({ children, onZoom, active }: { children: React.ReactNode; onZoom: (z: boolean) => void; active: boolean }) {
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const startDist = useRef(0)
  const startScale = useRef(1)
  const last = useRef<{ x: number; y: number } | null>(null)
  const lastTap = useRef(0)
  const [t, setT] = useState({ s: 1, x: 0, y: 0 })

  useEffect(() => {
    if (!active) setT({ s: 1, x: 0, y: 0 })
  }, [active])
  useEffect(() => onZoom(t.s > 1.01), [t.s, onZoom])

  const dist = () => {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  return (
    <div
      className="touch-none select-none"
      style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transition: pointers.current.size ? 'none' : 'transform .2s' }}
      onPointerDown={(e) => {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        if (pointers.current.size === 2) {
          startDist.current = dist()
          startScale.current = t.s
        }
        last.current = { x: e.clientX, y: e.clientY }
        const now = performance.now()
        if (now - lastTap.current < 280) setT((v) => (v.s > 1 ? { s: 1, x: 0, y: 0 } : { s: 2.5, x: 0, y: 0 }))
        lastTap.current = now
      }}
      onPointerMove={(e) => {
        if (!pointers.current.has(e.pointerId)) return
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (pointers.current.size === 2 && startDist.current) {
          const s = Math.max(1, Math.min(4, (startScale.current * dist()) / startDist.current))
          setT((v) => ({ ...v, s }))
        } else if (pointers.current.size === 1 && t.s > 1 && last.current) {
          const dx = e.clientX - last.current.x
          const dy = e.clientY - last.current.y
          setT((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
          last.current = { x: e.clientX, y: e.clientY }
        }
      }}
      onPointerUp={(e) => {
        pointers.current.delete(e.pointerId)
        if (pointers.current.size < 2) startDist.current = 0
        setT((v) => (v.s <= 1.02 ? { s: 1, x: 0, y: 0 } : v))
      }}
      onPointerCancel={(e) => pointers.current.delete(e.pointerId)}
    >
      {children}
    </div>
  )
}
