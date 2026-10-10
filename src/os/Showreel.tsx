'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { duckBed } from '@/lib/sound'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { Footage } from './Footage'

const MuxPlayer = dynamic(() => import('@mux/mux-player-react/lazy'), { ssr: false })

const PLAYBACK_ID = process.env.NEXT_PUBLIC_MUX_SHOWREEL_PLAYBACK_ID

/** Showreel streams from Mux (adaptive bitrate, WebVTT captions); muted autoplay with a speaker toggle. */
export function Showreel() {
  const [muted, setMuted] = useState(true)
  const [near, setNear] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // Mount the player only when this copy is actually near the viewport (a copy
  // hidden by the phone/desktop layout never intersects, so it never streams),
  // and never on Save Data or under reduced motion: those get the poster.
  useEffect(() => {
    const el = box.current
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (!el || !PLAYBACK_ID || reduced || saveData) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])
  if (!PLAYBACK_ID) return <Footage label="Showreel: 60 seconds of stores, screens and launches" tone="ink" />
  if (!near)
    return (
      <div ref={box} className="relative size-full bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://image.mux.com/${PLAYBACK_ID}/thumbnail.webp?width=1280`} alt="Ascendit showreel" className="size-full object-cover" fetchPriority="high" />
      </div>
    )
  return (
    <div className="relative size-full bg-ink">
      <MuxPlayer
        playbackId={PLAYBACK_ID}
        streamType="on-demand"
        autoPlay="muted"
        loop
        muted={muted}
        defaultHiddenCaptions={false}
        metadata={{ video_title: 'Ascendit showreel' }}
        style={{ height: '100%', width: '100%', ['--controls' as string]: 'none' }}
        onPlay={() => !muted && duckBed(true)}
        onPause={() => duckBed(false)}
      />
      <button
        type="button"
        aria-pressed={!muted}
        onClick={() => {
          setMuted((m) => !m)
          duckBed(muted)
        }}
        className="absolute bottom-3 right-3 rounded-pill bg-window/90 px-3 py-1.5 font-mono text-xs text-ink shadow-window"
      >
        {muted ? 'Sound off' : 'Sound on'}
      </button>
    </div>
  )
}
