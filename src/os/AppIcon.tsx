import type { Accent } from '@/lib/types'

const GLOSS: Record<Accent, string> = {
  lilac: 'from-[#E4DBFF] to-lilac',
  tangerine: 'from-[#FFC59E] to-tangerine',
  aqua: 'from-[#8EC5FF] to-aqua',
  lime: 'from-[#E9FFB0] to-lime',
}

/** Glossy app tile. Text on tiles is Ink, except the Aqua tile which carries white like the Aqua button. */
export function AppIcon({ glyph, accent, className = 'size-12' }: { glyph: string; accent: Accent; className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[28%] border border-ink/10 bg-gradient-to-b ${GLOSS[accent]} shadow-[inset_0_1px_0_rgb(255_255_255/.7),0_6px_14px_-6px_rgb(14_14_18/.35)] ${className}`}
    >
      <span className="absolute inset-x-[8%] top-[4%] h-[45%] rounded-[40%] bg-gradient-to-b from-white/70 to-white/0" />
      <span className={`relative font-sans text-[0.8em] font-semibold tracking-tight ${accent === 'aqua' ? 'text-white' : 'text-ink'}`}>
        {glyph}
      </span>
    </span>
  )
}
