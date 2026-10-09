'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { duckBed } from '@/lib/sound'
import { Footage } from './Footage'

const MuxPlayer = dynamic(() => import('@mux/mux-player-react/lazy'), { ssr: false })

const PLAYBACK_ID = process.env.NEXT_PUBLIC_MUX_SHOWREEL_PLAYBACK_ID

/** Showreel streams from Mux (adaptive bitrate, WebVTT captions); muted autoplay with a speaker toggle. */
export function Showreel() {
  const [muted, setMuted] = useState(true)
  if (!PLAYBACK_ID) return <Footage label="Showreel: 60 seconds of stores, screens and launches" tone="ink" />
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
