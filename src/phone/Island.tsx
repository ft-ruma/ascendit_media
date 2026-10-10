'use client'
import { useEffect, useRef, useState } from 'react'
import { useBuilder } from '@/builder/store'
import { STEPS } from '@/builder/schema'
import { haptic } from '@/lib/haptics'
import { disableSound, enableSound, useSound } from '@/lib/sound'
import { usePhone } from './store'

/**
 * Our island: a black capsule with live activities. Priority: a just-sent
 * brief, the open builder, sound playing, then the default "Open for projects".
 * Tapping expands it with the matching action.
 */
export function Island({ open }: { open: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const flash = usePhone((s) => s.flash)
  const builderOpen = useBuilder((s) => s.modalOpen)
  const step = useBuilder((s) => s.step)
  const builderStatus = useBuilder((s) => s.status)
  const sound = useSound((s) => s.enabled)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!expanded) return
    const close = (e: Event) => !ref.current?.contains(e.target as Node) && setExpanded(false)
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', key)
    }
  }, [expanded])

  const soundOn = mounted && sound
  const briefInProgress = mounted && builderStatus === 'editing' && step > 0
  const activity = flash?.kind === 'sent' ? 'sent' : mounted && builderOpen ? 'builder' : soundOn ? 'sound' : 'idle'

  let label: React.ReactNode
  if (activity === 'sent') label = <><Check /> <span>Brief sent</span></>
  else if (activity === 'builder') label = <><Ring step={step} /> <span>Brief {step + 1} of {STEPS.length}</span></>
  else if (activity === 'sound') label = <><Wave /> <span>Ascendit sound</span></>
  else label = open ? <><LiveDot /> <span>Open for projects</span></> : <span>Ascendit</span>

  return (
    <div ref={ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="island-panel"
        onClick={() => {
          haptic()
          setExpanded((e) => !e)
        }}
        className="island flex h-[34px] min-w-[150px] items-center justify-center gap-2 rounded-pill bg-ink px-4 font-mono text-[12px] text-window shadow-[0_6px_16px_-8px_rgb(14_14_18/.6)]"
        aria-live="polite"
      >
        {label}
      </button>
      {expanded && (
        <div id="island-panel" className="island-panel absolute left-1/2 top-0 w-[min(92vw,360px)] -translate-x-1/2 rounded-[28px] bg-ink p-4 text-window shadow-lift">
          {activity === 'sent' && flash?.kind === 'sent' && (
            <p className="text-[15px]">Brief sent. Reference <span className="font-mono">{flash.reference}</span>. We reply within one working day.</p>
          )}
          {(activity === 'builder' || (activity !== 'sent' && briefInProgress)) && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px]">Your brief is {step + 1} of {STEPS.length} done.</p>
              <button type="button" className="h-11 rounded-pill bg-window px-4 text-[14px] font-medium text-ink" onClick={() => { useBuilder.getState().openModal({ source: 'island' }); setExpanded(false) }}>
                Resume brief
              </button>
            </div>
          )}
          {activity === 'sound' && (
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[15px]"><Wave /> Ascendit sound is on</p>
              <button type="button" className="h-11 rounded-pill bg-window px-4 text-[14px] font-medium text-ink" onClick={() => { disableSound(); setExpanded(false) }}>
                Mute
              </button>
            </div>
          )}
          {activity === 'idle' && !briefInProgress && (
            <div className="grid gap-3">
              <p className="flex items-center gap-2 text-[15px]"><LiveDot /> Taking on new projects this month.</p>
              <div className="flex gap-2">
                <button type="button" className="btn-aqua h-11 flex-1 text-[14px]" onClick={() => { useBuilder.getState().openModal({ source: 'island' }); setExpanded(false) }}>
                  Start a project
                </button>
                <button type="button" className="h-11 rounded-pill bg-window/15 px-4 text-[14px] text-window" onClick={() => void enableSound()}>
                  Sound on
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LiveDot() {
  return (
    <span className="relative flex size-2" aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75 motion-reduce:animate-none" />
      <span className="relative inline-flex size-2 rounded-full bg-lime" />
    </span>
  )
}

function Wave() {
  return (
    <span className="wave flex h-3 items-center gap-[2px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => <span key={i} className="w-[2px] rounded-full bg-lime" style={{ animationDelay: `${i * 0.12}s` }} />)}
    </span>
  )
}

function Ring({ step }: { step: number }) {
  const p = (step + 1) / STEPS.length
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 -rotate-90" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgb(255 255 255 / .25)" strokeWidth="2.5" />
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-aqua)" strokeWidth="2.5" strokeDasharray={`${p * 37.7} 37.7`} strokeLinecap="round" />
    </svg>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="var(--color-lime)" />
      <path d="M4.5 8.3l2.2 2.2 4.8-5" fill="none" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
