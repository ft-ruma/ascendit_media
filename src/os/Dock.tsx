import Link from 'next/link'
import type { Product, Settings } from '@/lib/types'
import { whatsappLink } from '@/lib/whatsapp'
import { AppIcon } from './AppIcon'
import { StartButton } from './StartButton'
import { WhatsAppLink } from './WhatsAppLink'

/** Desktop: floating dock with CSS-only magnify. Under 1024px: bottom bar with Start a project always visible. */
export function Dock({ products, settings }: { products: Product[]; settings: Settings }) {
  const wa = whatsappLink(settings.whatsapp, '/')
  // Instagram and LinkedIn from Settings → socials, in that order.
  const socials = (['instagram', 'linkedin'] as const).flatMap((kind) => {
    const s = settings.socials.find((x) => x.url.includes(`${kind}.com`))
    return s ? [{ ...s, kind }] : []
  })
  return (
    <>
      <nav aria-label="Dock" className="dock pointer-events-none fixed inset-x-0 bottom-4 z-40 hidden justify-center lg:flex">
        <ul className="pointer-events-auto flex items-end gap-2 rounded-[22px] border border-white/60 bg-white/55 px-2.5 py-2 shadow-window backdrop-blur-2xl backdrop-saturate-150">
          {products.map((p) => (
            <li key={p.slug} className="dock-item">
              <Link href={`/products/${p.slug}`} className="group relative block" aria-label={p.name}>
                <AppIcon glyph={p.glyph} accent={p.accent} className="size-12 text-[15px]" />
                <span className="dock-label">{p.name}</span>
              </Link>
            </li>
          ))}
          <li aria-hidden className="mx-1 h-10 w-px self-center bg-ink/10" />
          <li className="dock-item">
            <Link href="/work" className="group relative block" aria-label="Work">
              <span className="grid size-12 place-items-center rounded-[28%] border border-ink/10 bg-gradient-to-b from-white to-plaster shadow-[inset_0_1px_0_white,0_6px_14px_-6px_rgb(14_14_18/.35)]">
                <svg viewBox="0 0 24 24" className="size-6 text-ink" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                  <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
                </svg>
              </span>
              <span className="dock-label">Work</span>
            </Link>
          </li>
          <li className="dock-item">
            <WhatsAppLink href={wa} className="group relative block" label="WhatsApp us">
              <span className="grid size-12 place-items-center rounded-[28%] border border-ink/10 bg-gradient-to-b from-[#9BF0B6] to-[#25D366] shadow-[inset_0_1px_0_rgb(255_255_255/.7),0_6px_14px_-6px_rgb(14_14_18/.35)]">
                <WaGlyph className="size-6 text-ink" />
              </span>
              <span className="dock-label">WhatsApp</span>
            </WhatsAppLink>
          </li>
          {socials.map((s) => (
            <li key={s.url} className="dock-item">
              <a href={s.url} target="_blank" rel="noopener" className="group relative block" aria-label={`Ascendit on ${s.label}`}>
                <span className={`grid size-12 place-items-center rounded-[28%] border border-ink/10 shadow-[inset_0_1px_0_rgb(255_255_255/.6),0_6px_14px_-6px_rgb(14_14_18/.35)] ${SOCIAL[s.kind].tile}`}>
                  {SOCIAL[s.kind].glyph}
                </span>
                <span className="dock-label">{s.label}</span>
              </a>
            </li>
          ))}
          <li className="dock-item">
            <StartButton source="dock" className="group relative block" >
              <span className="grid size-12 place-items-center rounded-[28%] border border-ink/10 bg-gradient-to-b from-[#8EC5FF] to-aqua shadow-[inset_0_1px_0_rgb(255_255_255/.7),0_6px_14px_-6px_rgb(14_14_18/.35)]">
                <svg viewBox="0 0 24 24" className="size-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span className="dock-label">Start a project</span>
            </StartButton>
          </li>
        </ul>
      </nav>

      {/* Phones and tablets use PhoneDock (src/phone). */}
    </>
  )
}

export function WaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  )
}

const SOCIAL = {
  instagram: {
    tile: 'bg-[radial-gradient(circle_at_30%_110%,#FFD776_0%,#F77737_30%,#E1306C_55%,#C13584_75%,#833AB4_100%)]',
    glyph: (
      <svg viewBox="0 0 24 24" className="size-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  linkedin: {
    tile: 'bg-gradient-to-b from-[#3A8BDB] to-[#0A66C2]',
    glyph: (
      <svg viewBox="0 0 24 24" className="size-6 text-white" fill="currentColor" aria-hidden>
        <path d="M6.94 8.5H3.56V20h3.38zM5.25 3.5a1.97 1.97 0 1 0 0 3.94 1.97 1.97 0 0 0 0-3.94M20.44 13.4c0-3.1-1.65-5.15-4.5-5.15a3.9 3.9 0 0 0-3.5 1.92V8.5H9.2V20h3.38v-6.06c0-1.6.62-2.86 2.2-2.86 1.55 0 2.28 1.1 2.28 2.86V20h3.38z" />
      </svg>
    ),
  },
} as const
