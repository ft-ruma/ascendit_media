import Link from 'next/link'
import type { Accent } from '@/lib/types'

const TAB: Record<Accent, string> = { lilac: 'fill-lilac', tangerine: 'fill-tangerine', aqua: 'fill-aqua', lime: 'fill-lime' }

/** A folder on the desktop. Real link, keyboard reachable. */
export function DesktopIcon({ href, label, accent = 'aqua', className = '' }: { href: string; label: string; accent?: Accent; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex w-24 flex-col items-center gap-1.5 rounded-lg p-1.5 text-center ${className}`}>
      <svg viewBox="0 0 64 52" className="h-14 w-16 drop-shadow-[0_6px_8px_rgb(14_14_18/.18)] transition group-hover:-translate-y-0.5" aria-hidden>
        <path d="M4 10a4 4 0 0 1 4-4h16l5 5h27a4 4 0 0 1 4 4v3H4z" className={TAB[accent]} />
        <rect x="4" y="15" width="56" height="33" rx="5" className="fill-white stroke-ink/10" />
        <rect x="4" y="15" width="56" height="10" rx="5" className="fill-paper" />
      </svg>
      <span className="rounded px-1.5 text-[13px] font-medium text-ink group-hover:bg-aqua-deep group-hover:text-white">{label}</span>
    </Link>
  )
}
