'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useBuilder } from '@/builder/store'
import { haptic } from '@/lib/haptics'
import { WaGlyph } from '@/os/Dock'
import { StartButton } from '@/os/StartButton'
import { WhatsAppLink } from '@/os/WhatsAppLink'

/** Frosted dock for phones and tablets: hides on scroll down, returns on scroll up, never hides with the builder open. */
export function PhoneDock({ whatsappHref }: { whatsappHref: string }) {
  const [hidden, setHidden] = useState(false)
  const builderOpen = useBuilder((s) => s.modalOpen)

  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const dy = y - last
        if (Math.abs(dy) > 6) setHidden(dy > 0 && y > 120)
        last = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHidden = hidden && !builderOpen
  return (
    <nav
      aria-label="Dock"
      className="phone-dock fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),8px)] transition-transform duration-300 ease-out lg:hidden"
      style={{ transform: isHidden ? 'translateY(calc(100% + 8px))' : undefined }}
    >
      <ul className="mx-auto flex max-w-[420px] items-center justify-around gap-2 rounded-[30px] border border-white/70 bg-white/55 px-3 py-2.5 shadow-window backdrop-blur-2xl backdrop-saturate-150">
        <li>
          <DockTile href="/work" label="Work" tone="bg-gradient-to-b from-white to-plaster">
            <svg viewBox="0 0 24 24" className="size-7 text-ink" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
            </svg>
          </DockTile>
        </li>
        <li>
          <DockTile href="/products" label="Products" tone="bg-gradient-to-b from-[#E4DBFF] to-lilac">
            <svg viewBox="0 0 24 24" className="size-7 text-ink" fill="currentColor" aria-hidden>
              <rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" opacity=".55" />
              <rect x="4" y="13" width="7" height="7" rx="2" opacity=".55" /><rect x="13" y="13" width="7" height="7" rx="2" />
            </svg>
          </DockTile>
        </li>
        <li>
          <WhatsAppLink href={whatsappHref} label="Chat on WhatsApp" className="flex flex-col items-center">
            <span className="grid size-14 place-items-center rounded-[18px] border border-ink/10 bg-gradient-to-b from-[#9BF0B6] to-[#25D366] shadow-[inset_0_1px_0_rgb(255_255_255/.7),0_6px_14px_-6px_rgb(14_14_18/.35)]" onPointerDown={haptic}>
              <WaGlyph className="size-7 text-ink" />
            </span>
          </WhatsAppLink>
        </li>
        <li>
          <StartButton source="phone-dock" className="flex flex-col items-center">
            <span className="grid size-14 place-items-center rounded-[18px] border border-ink/10 bg-gradient-to-b from-[#8EC5FF] to-aqua-deep shadow-[inset_0_1px_0_rgb(255_255_255/.7),0_8px_18px_-6px_rgb(31_95_224/.7)]" onPointerDown={haptic}>
              <svg viewBox="0 0 24 24" className="size-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="sr-only">Start a project</span>
          </StartButton>
        </li>
      </ul>
      <span aria-hidden className="mx-auto mt-2 block h-[5px] w-32 rounded-full bg-ink/80" />
    </nav>
  )
}

function DockTile({ href, label, tone, children }: { href: string; label: string; tone: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} data-app className="flex flex-col items-center" onPointerDown={haptic}>
      <span className={`grid size-14 place-items-center rounded-[18px] border border-ink/10 shadow-[inset_0_1px_0_white,0_6px_14px_-6px_rgb(14_14_18/.35)] ${tone}`}>{children}</span>
    </Link>
  )
}
