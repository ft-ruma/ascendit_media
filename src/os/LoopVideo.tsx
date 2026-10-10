'use client'
import { useEffect, useRef } from 'react'
import type { Media } from '@/lib/types'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { Footage } from './Footage'

type Props = { video?: Media; label: string; className?: string; tone?: 'plaster' | 'paper' | 'ink' }

/**
 * Muted loop: preload="none", sources attach and play only within 200px of the
 * viewport, pause when out. Reduced motion shows the poster only. With no clip
 * uploaded yet it renders a placeholder frame labelled with what goes there.
 */
export function LoopVideo({ video, label, className = '', tone = 'plaster' }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    // Save Data: posters only (sources never attach, so nothing downloads).
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (!el || reduced || saveData) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!el.dataset.loaded) {
            el.querySelectorAll('source').forEach((s) => (s.src = s.dataset.src ?? ''))
            el.load()
            el.dataset.loaded = '1'
          }
          void el.play().catch(() => {})
        } else el.pause()
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  if (!video?.url) return <Footage label={label} className={className} tone={tone} />

  const poster = video.poster?.url
  if (reduced)
    return poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster} alt={video.alt || label} className={`size-full object-cover ${className}`} />
    ) : (
      <Footage label={label} className={className} tone={tone} />
    )

  return (
    <video ref={ref} muted playsInline loop preload="none" poster={poster} aria-label={video.alt || label} className={`size-full object-cover ${className}`}>
      <source data-src={video.url} type={video.mimeType ?? 'video/mp4'} />
    </video>
  )
}
