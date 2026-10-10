'use client'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef } from 'react'
import { useWindows } from '@/os/store'
import { cue } from '@/lib/sound'
import type { RateCard } from '@/lib/types'
import { useBuilder } from './store'

// The builder code loads only when someone opens it (first-load JS budget).
const Builder = dynamic(() => import('./Builder').then((m) => m.Builder), {
  ssr: false,
  loading: () => <div className="grid h-80 place-items-center font-mono text-[13px] text-graphite">Opening builder...</div>,
})

// Phones and tablets get the one-question-per-screen builder.
const SheetBuilder = dynamic(() => import('./SheetBuilder').then((m) => m.SheetBuilder), {
  ssr: false,
  loading: () => <div className="grid h-60 place-items-center font-mono text-[13px] text-graphite">Opening brief...</div>,
})
const BottomSheet = dynamic(() => import('@/phone/BottomSheet').then((m) => m.BottomSheet), { ssr: false })

const ID = 'builder-modal'

type Mode = 'phone' | 'tablet' | 'desktop'
const modeNow = (): Mode =>
  matchMedia('(max-width: 767.98px)').matches ? 'phone' : matchMedia('(max-width: 1023.98px)').matches ? 'tablet' : 'desktop'

/** The builder as an overlay window: from the menu bar, dock, service pages and home beat 8. */
export function BuilderModal({ rateCard }: { rateCard: RateCard }) {
  const open = useBuilder((s) => s.modalOpen)
  const close = useBuilder((s) => s.closeModal)
  const wm = useWindows()
  const dialog = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  // Safe to read during render: the modal is never open on the server or at hydration.
  const mode = useMemo<Mode>(() => (open ? modeNow() : 'desktop'), [open])

  useEffect(() => {
    void useBuilder.persist.rehydrate()
  }, [])

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement
    wm.open(ID, { overlay: true })
    void cue('windowOpen')
    document.documentElement.style.overflow = 'hidden'
    requestAnimationFrame(() => dialog.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      // Escape closes the focused overlay window.
      if (e.key === 'Escape' && useWindows.getState().focused === ID) close()
      if (e.key === 'Tab' && dialog.current) trapFocus(e, dialog.current)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      wm.close(ID)
      void cue('windowClose')
      returnFocus.current?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close])

  if (!open) return null
  if (mode === 'phone') {
    return (
      <BottomSheet label="New project brief" onClose={close}>
        <SheetBuilder rateCard={rateCard} onDone={close} />
      </BottomSheet>
    )
  }
  if (mode === 'tablet') {
    return (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/25 p-6" onMouseDown={(e) => e.target === e.currentTarget && close()}>
        <div ref={dialog} role="dialog" aria-modal="true" aria-label="New project brief" tabIndex={-1} className="folder-pop flex h-[min(760px,88svh)] w-full max-w-[620px] flex-col overflow-hidden rounded-[28px] border border-hairline bg-window pt-5 shadow-lift outline-none">
          <SheetBuilder rateCard={rateCard} onDone={close} />
        </div>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-ink/25 backdrop-blur-[2px] sm:place-items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="builder-title"
        tabIndex={-1}
        className="builder-pop flex max-h-[92dvh] w-full max-w-[980px] flex-col overflow-hidden rounded-t-window border border-hairline bg-window shadow-lift outline-none sm:rounded-window"
      >
        <header className="relative flex h-10 shrink-0 items-center border-b border-hairline bg-gradient-to-b from-white to-paper/60 px-3">
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Close builder" onClick={close} className="size-3 rounded-full border border-ink/10 bg-tangerine" />
            <span aria-hidden className="size-3 rounded-full border border-ink/10 bg-ink/10" />
            <span aria-hidden className="size-3 rounded-full border border-ink/10 bg-ink/10" />
          </div>
          <h2 id="builder-title" className="absolute inset-x-24 text-center font-mono text-[13px] text-ink">
            new-project.brief
          </h2>
          <button type="button" onClick={close} className="ml-auto rounded-md px-2 py-1 font-mono text-[12px] text-graphite hover:bg-ink/5">
            Esc
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Builder rateCard={rateCard} variant="modal" onDone={close} />
        </div>
      </div>
    </div>
  )
}

function trapFocus(e: KeyboardEvent, root: HTMLElement) {
  const els = root.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([tabindex="-1"]),select,textarea,[tabindex="0"]')
  if (!els.length) return
  const first = els[0]
  const last = els[els.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
