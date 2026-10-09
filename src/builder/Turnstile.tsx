'use client'
import { useEffect, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void }
  }
}

let loader: Promise<void> | null = null
function loadScript() {
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
  return loader
}

/** Cloudflare Turnstile, only rendered when a site key is configured. */
export function Turnstile({ onToken }: { onToken: (t: string | null) => void }) {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!SITE_KEY || !el.current) return
    let id: string | undefined
    void loadScript().then(() => {
      if (!el.current || !window.turnstile) return
      id = window.turnstile.render(el.current, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        callback: (t: string) => onToken(t),
        'expired-callback': () => onToken(null),
      })
    })
    return () => {
      if (id) window.turnstile?.remove(id)
    }
  }, [onToken])
  if (!SITE_KEY) return null
  return <div ref={el} className="mt-4" />
}
