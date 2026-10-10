import Link from 'next/link'
import type { ReactNode } from 'react'

/** Home-screen app icon: our own squircle tile + label. A real link to a real route. */
export function AppTile({ href, label, tile, children }: { href: string; label: string; tile: string; children: ReactNode }) {
  return (
    <Link href={href} data-app className="app-tile group flex flex-col items-center gap-1.5 rounded-[18px] outline-offset-4">
      <span className={`relative grid size-[62px] place-items-center overflow-hidden rounded-[18px] border border-ink/10 shadow-[inset_0_1px_0_rgb(255_255_255/.65),0_8px_16px_-10px_rgb(14_14_18/.45)] transition group-active:scale-90 ${tile}`}>
        <span aria-hidden className="absolute inset-x-[8%] top-[4%] h-[42%] rounded-[40%] bg-gradient-to-b from-white/55 to-white/0" />
        <span className="relative" aria-hidden>{children}</span>
      </span>
      <span className="max-w-[78px] truncate text-center text-[12px] font-medium leading-tight text-ink">{label}</span>
    </Link>
  )
}

export const glyph = {
  work: (
    <svg viewBox="0 0 24 24" className="size-8 text-ink" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 24 24" className="size-8 text-ink" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <path d="M6 8h12M6 12h12M6 16h8" />
    </svg>
  ),
  photos: (
    <svg viewBox="0 0 24 24" className="size-8 text-ink" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
      <rect x="6" y="3.5" width="13" height="15" rx="1.5" transform="rotate(8 12 11)" fill="white" />
      <rect x="4" y="5.5" width="13" height="15" rx="1.5" fill="white" />
      <path d="M6 16l3-3 2.5 2.5L14 13l1 1" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 24 24" className="size-8 text-white" fill="currentColor">
      <path d="M12 4c-4.97 0-9 3.13-9 7 0 2.1 1.2 3.98 3.1 5.26L5.5 20l3.9-2.2c.83.13 1.7.2 2.6.2 4.97 0 9-3.13 9-7s-4.03-7-9-7z" />
    </svg>
  ),
  studio: (
    <svg viewBox="0 0 24 24" className="size-8 text-window" fill="currentColor">
      <path d="M8.5 19c-2.3 0-3.7-1.2-3.7-3.1 0-2.6 2.6-3.5 6.4-3.5h1.1v-.6c0-1.7-.7-2.4-2-2.4-1 0-1.5.5-1.9 1.6-.3.8-.7 1.1-1.5 1.1-.9 0-1.5-.6-1.5-1.4C5.4 8.7 7.6 7.5 11 7.5c3.6 0 5.2 1.5 5.2 4.6v4.1c0 .9.3 1.3.9 1.3.3 0 .5-.1.7-.2l.2.5c-.6.8-1.6 1.2-2.7 1.2-1.3 0-2.2-.6-2.5-1.6-.8 1-2.1 1.6-4.3 1.6zm2-2c1 0 1.8-.6 1.8-1.9v-1.4h-.6c-2 0-3 .6-3 1.8 0 .9.6 1.5 1.8 1.5z" />
    </svg>
  ),
  careers: (
    <svg viewBox="0 0 24 24" className="size-8 text-ink" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
      <rect x="3.5" y="7.5" width="17" height="11" rx="2" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 12h17" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" className="size-8 text-ink" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  ),
  retail: (
    <svg viewBox="0 0 24 24" className="size-7 text-ink" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round">
      <path d="M4 9l1.5-4.5h13L20 9M4 9h16v10.5H4zM4 9c0 1.4 1.1 2.5 2.7 2.5S9.3 10.4 9.3 9c0 1.4 1.2 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1.1 2.5 2.6 2.5S20 10.4 20 9M10 19.5v-4h4v4" />
    </svg>
  ),
  software: (
    <svg viewBox="0 0 24 24" className="size-7 text-ink" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13" />
    </svg>
  ),
  web: (
    <svg viewBox="0 0 24 24" className="size-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17" />
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 24 24" className="size-7 text-ink" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round">
      <path d="M12 3.5l2.4 5 5.6.8-4 3.9.9 5.6-4.9-2.7-4.9 2.7.9-5.6-4-3.9 5.6-.8z" />
    </svg>
  ),
}

export const tiles = {
  work: 'bg-gradient-to-b from-white to-plaster',
  notes: 'bg-[linear-gradient(to_bottom,var(--color-lime)_0_26%,#FFFFFF_26%,#F7F3E6)]',
  photos: 'bg-gradient-to-b from-[#FFC59E] to-tangerine',
  messages: 'bg-gradient-to-b from-[#5C9BFF] to-aqua-deep',
  studio: 'bg-gradient-to-b from-[#2A2A33] to-ink',
  careers: 'bg-gradient-to-b from-[#E4DBFF] to-lilac',
  contact: 'bg-gradient-to-b from-[#E9FFB0] to-lime',
  retail: 'bg-gradient-to-b from-[#FFC59E] to-tangerine',
  software: 'bg-gradient-to-b from-[#E4DBFF] to-lilac',
  web: 'bg-gradient-to-b from-[#8EC5FF] to-aqua-deep',
  brand: 'bg-gradient-to-b from-[#E9FFB0] to-lime',
} as const
