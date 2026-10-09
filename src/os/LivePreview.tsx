'use client'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** In draft mode, re-render the page whenever an editor saves in Payload. */
export function LivePreview() {
  const router = useRouter()
  return (
    <>
      <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={process.env.NEXT_PUBLIC_SITE_URL ?? ''} />
      <a href="/api/exit-preview" className="fixed left-3 top-14 z-[60] rounded-pill bg-tangerine px-3 py-1 font-mono text-xs text-ink shadow-window">
        Draft preview · exit
      </a>
    </>
  )
}
