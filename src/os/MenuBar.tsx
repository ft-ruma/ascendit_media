import Link from 'next/link'
import type { Settings } from '@/lib/types'
import { Clock } from './Clock'
import { CurrencySwitch } from './CurrencySwitch'
import { MobileMenu } from './MobileMenu'
import { SoundToggle } from './SoundToggle'
import { StartButton } from './StartButton'
import { Wordmark } from './Wordmark'

export const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/services/retail-design', label: 'Services', match: '/services' },
  { href: '/products', label: 'Products' },
  { href: '/studio', label: 'Studio' },
  { href: '/careers', label: 'Careers' },
]

export function MenuBar({ settings }: { settings: Settings }) {
  return (
    <header className="sticky top-0 z-50 h-11 max-lg:hidden border-b border-hairline bg-paper/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-full max-w-[1536px] items-center gap-5 px-4 lg:px-6">
        <Link href="/" className="shrink-0" aria-label="Ascendit home">
          <Wordmark className="h-[18px] w-auto" />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[14px]">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="rounded-md px-2.5 py-1 text-ink transition hover:bg-ink/5">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {settings.openForProjects && (
            <span className="hidden items-center gap-2 text-[13px] text-ink xl:inline-flex">
              <span className="relative flex size-2.5" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2.5 rounded-full border border-ink/20 bg-lime" />
              </span>
              Open for projects
            </span>
          )}
          <span className="hidden md:inline"><Clock /></span>
          <CurrencySwitch className="hidden sm:inline-flex" />
          <SoundToggle />
          <StartButton source="menubar" className="btn-aqua hidden h-8 px-4 text-[13px] sm:inline-flex">
            Start a project
          </StartButton>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
