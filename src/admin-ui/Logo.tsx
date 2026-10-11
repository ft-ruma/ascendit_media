import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from '@/os/wordmark-paths'

/** Ascendit wordmark on the admin login screen. */
export function Logo() {
  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
      <svg viewBox={WORDMARK_VIEWBOX} style={{ height: 40, width: 'auto' }} role="img" aria-label="Ascendit">
        {Object.values(WORDMARK_PATHS).map((d, i) => <path key={i} d={d} fill="currentColor" fillRule="evenodd" />)}
      </svg>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, opacity: 0.7 }}>ascendit-os · admin</span>
    </div>
  )
}

/** The "a" tile in the admin nav. */
export function Icon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icon.svg" alt="Ascendit" width={26} height={26} style={{ borderRadius: 7 }} />
  )
}
