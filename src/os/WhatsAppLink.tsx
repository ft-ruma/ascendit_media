'use client'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { track } from '@/lib/analytics'

/** Swaps the pre-filled text for the page the visitor is on right now. */
export function WhatsAppLink({ href, className, label, children }: { href: string; className?: string; label: string; children: ReactNode }) {
  const pathname = usePathname()
  const url = new URL(href)
  url.searchParams.set('text', `Hi, I was looking at ${pathname === '/' ? 'your website' : pathname}`)
  return (
    <a href={url.toString()} target="_blank" rel="noopener" aria-label={label} className={className} onClick={() => track('WhatsApp', { page: pathname })}>
      {children}
    </a>
  )
}
