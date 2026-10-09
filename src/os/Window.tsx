'use client'
import { m, useDragControls } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useRef, type CSSProperties, type ReactNode } from 'react'
import { accentBg } from '@/lib/pillars'
import { cue } from '@/lib/sound'
import type { Accent } from '@/lib/types'
import { prefersReducedMotion } from '@/lib/useReducedMotion'
import { useWindows, zIndexOf } from './store'
import { isDesktop, useZoom } from './zoom'

export type WindowPos = { x: string; y: string; w: string; r?: number }

type Props = {
  title: string
  children: ReactNode
  /** Opening the title (or the green light) navigates here with the zoom transition. */
  href?: string
  accent?: Accent
  /** Absolute placement on the desktop at 1024px+; normal flow below. */
  pos?: WindowPos
  delay?: number
  className?: string
  bodyClassName?: string
  /** Toolbar content on the right of the title bar. */
  toolbar?: ReactNode
  draggable?: boolean
  /** false for above-the-fold windows so the LCP text paints without waiting for JS. */
  reveal?: boolean
}

export function Window({
  title, children, href, accent, pos, delay = 0, className = '', bodyClassName = 'p-5', toolbar, draggable = true, reveal = true,
}: Props) {
  const reactId = useId()
  const id = `win-${reactId.replace(/:/g, '')}`
  const titleId = `${id}-title`
  const ref = useRef<HTMLElement>(null)
  const controls = useDragControls()
  const router = useRouter()
  const { zOrder, minimised, focus, minimise, restore } = useWindows()
  const startZoom = useZoom((s) => s.start)
  const isMin = minimised.includes(id)

  const style = {
    zIndex: zIndexOf(zOrder, id),
    ...(pos ? { '--x': pos.x, '--y': pos.y, '--w': pos.w, '--r': `${pos.r ?? 0}deg` } : {}),
  } as CSSProperties

  const openPage = (e: React.MouseEvent) => {
    if (!href) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || !isDesktop() || prefersReducedMotion()) return // plain navigation
    e.preventDefault()
    const rect = ref.current?.getBoundingClientRect()
    if (rect) startZoom(rect, href, accent)
    void cue('windowOpen')
    router.push(href)
  }

  const placed = pos ? 'lg:absolute lg:left-(--x) lg:top-(--y) lg:w-(--w) lg:rotate-(--r)' : ''

  if (isMin) {
    return (
      <div className={`${placed} ${className} flex items-start`} style={style}>
        <button
          type="button"
          onClick={() => { restore(id); focus(id); void cue('windowOpen') }}
          className="os-chip inline-flex items-center gap-2 rounded-pill border border-hairline bg-window px-3 py-1.5 font-mono text-xs text-ink shadow-window"
        >
          <span aria-hidden className={`size-2 rounded-full ${accent ? accentBg[accent] : 'bg-aqua'}`} />
          {title}
          <span className="sr-only">(restore window)</span>
        </button>
      </div>
    )
  }

  return (
    <m.section
      ref={ref}
      aria-labelledby={titleId}
      className={`os-window group/win relative flex flex-col overflow-hidden rounded-window border border-hairline bg-window shadow-window ${placed} ${className}`}
      style={style}
      initial={reveal ? { opacity: 0, y: 28, scale: 0.97 } : false}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 26, delay }}
      drag={draggable}
      dragControls={controls}
      dragListener={false}
      dragSnapToOrigin
      dragElastic={0.18}
      dragTransition={{ bounceStiffness: 420, bounceDamping: 22 }}
      whileDrag={{ scale: 1.015, boxShadow: 'var(--shadow-lift)', cursor: 'grabbing' }}
      onPointerDownCapture={() => focus(id)}
    >
      <header
        className="relative flex h-10 shrink-0 items-center gap-3 border-b border-hairline bg-gradient-to-b from-white to-paper/60 px-3 select-none lg:cursor-grab"
        onPointerDown={(e) => {
          if (draggable && isDesktop() && !(e.target as HTMLElement).closest('a,button')) controls.start(e)
        }}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={() => { minimise(id); void cue('windowClose') }}
            className={`size-3 rounded-full border border-ink/10 ${accent ? accentBg[accent] : 'bg-tangerine'} transition hover:brightness-95`}
          />
          <button
            type="button"
            aria-label={`Minimise ${title}`}
            tabIndex={-1}
            onClick={() => { minimise(id); void cue('windowClose') }}
            className="size-3 rounded-full border border-ink/10 bg-ink/10 transition group-hover/win:bg-lime"
          />
          {href ? (
            <Link
              href={href}
              onClick={openPage}
              aria-label={`Open ${title} full page`}
              tabIndex={-1}
              className="size-3 rounded-full border border-ink/10 bg-ink/10 transition group-hover/win:bg-aqua"
            />
          ) : (
            <span aria-hidden className="size-3 rounded-full border border-ink/10 bg-ink/10" />
          )}
        </div>
        <h2 id={titleId} className="absolute inset-x-24 truncate text-center font-mono text-[13px] text-graphite">
          {href ? (
            <Link href={href} onClick={openPage} className="text-ink underline-offset-4 hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </header>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </m.section>
  )
}
