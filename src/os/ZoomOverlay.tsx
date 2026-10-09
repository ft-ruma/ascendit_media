'use client'
import { AnimatePresence, m } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useZoom } from './zoom'

/** The window-to-page zoom: a window frame grows from its rect to the viewport, then fades once the route lands. */
export function ZoomOverlay() {
  const { rect, href, end } = useZoom()
  const pathname = usePathname()

  useEffect(() => {
    if (href && pathname === href.split('?')[0]) {
      const t = setTimeout(end, 120)
      return () => clearTimeout(t)
    }
  }, [pathname, href, end])

  // Safety net: never leave the overlay up if navigation stalls.
  useEffect(() => {
    if (!rect) return
    const t = setTimeout(end, 2500)
    return () => clearTimeout(t)
  }, [rect, end])

  return (
    <AnimatePresence>
      {rect && (
        <m.div
          aria-hidden
          className="pointer-events-none fixed z-[90] overflow-hidden rounded-window border border-hairline bg-window shadow-window"
          initial={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, opacity: 1 }}
          animate={{ top: 44, left: 0, width: '100vw', height: 'calc(100vh - 44px)', borderRadius: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', stiffness: 210, damping: 28 }}
        >
          <div className="h-10 border-b border-hairline bg-gradient-to-b from-white to-paper/60" />
        </m.div>
      )}
    </AnimatePresence>
  )
}
