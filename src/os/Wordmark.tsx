import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from './wordmark-paths'

/** The Ascendit wordmark. Always Ink, never recoloured. */
export function Wordmark({ className = 'h-5 w-auto', title = 'Ascendit' }: { className?: string; title?: string }) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} className={className} role="img" aria-label={title}>
      {Object.values(WORDMARK_PATHS).map((d, i) => (
        <path key={i} d={d} fill="#0E0E12" fillRule="evenodd" />
      ))}
    </svg>
  )
}
