'use client'

type Props = Record<string, string | number | boolean>
declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void
  }
}

/** Client analytics (Plausible). Ad conversions are sent server-side from /api/lead. */
export function track(event: string, props?: Props) {
  try {
    window.plausible?.(event, props ? { props } : undefined)
  } catch {
    // analytics must never break the page
  }
}
