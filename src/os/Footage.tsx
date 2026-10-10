/** Placeholder for footage that has not been shot yet: a framed slate, not a broken box. */
export function Footage({ label, className = '', tone = 'plaster', compact = false }: { label: string; className?: string; tone?: 'plaster' | 'paper' | 'ink'; compact?: boolean }) {
  const bg = tone === 'ink' ? 'bg-ink text-window' : tone === 'paper' ? 'bg-paper text-ink' : 'bg-plaster text-ink'
  return (
    <div role="img" aria-label={label} className={`footage relative isolate grid size-full min-h-40 place-items-center overflow-hidden ${bg} ${className}`}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60 [background:repeating-linear-gradient(135deg,transparent_0_22px,rgb(14_14_18/.04)_22px_23px)]" />
      <div aria-hidden className="footage-sheen absolute inset-0 -z-10" />
      {!compact && <span aria-hidden className="absolute left-3 top-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider opacity-70">
        <span className="size-1.5 rounded-full bg-tangerine" /> rec
      </span>}
      {!compact && <span aria-hidden className="absolute bottom-3 right-3 font-mono text-[11px] tabular-nums opacity-70">00:06:12</span>}
      <span aria-hidden className={`max-w-[24ch] text-balance text-center font-serif italic leading-tight opacity-80 ${compact ? 'px-2 text-[14px]' : 'px-6 text-[22px]'}`}>{label}</span>
    </div>
  )
}
