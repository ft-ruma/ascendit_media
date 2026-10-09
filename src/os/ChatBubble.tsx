'use client'
import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/** Glossy Y2K bubble that types out its words; shows the full text instantly under reduced motion. */
export function ChatBubble({ text, from = 'them', meta, className = '' }: { text: string; from?: 'them' | 'us'; meta?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduced = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) return setN(text.length)
    let i = 0
    const t = setInterval(() => {
      i += 2
      setN(Math.min(i, text.length))
      if (i >= text.length) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [inView, reduced, text])

  const us = from === 'us'
  return (
    <div ref={ref} className={`flex flex-col ${us ? 'items-end' : 'items-start'} ${className}`}>
      <p
        className={`relative max-w-[34ch] rounded-[22px] border px-4 py-3 text-[16px] leading-snug shadow-[inset_0_1px_0_rgb(255_255_255/.8),0_10px_24px_-14px_rgb(14_14_18/.35)] ${
          us
            ? 'rounded-br-md border-aqua/40 bg-gradient-to-b from-[#2F6FEA] to-aqua-deep text-white'
            : 'rounded-bl-md border-hairline bg-gradient-to-b from-white to-[#EEF0F3] text-ink'
        }`}
      >
        {/* Full text for assistive tech and no-JS; the typed copy is decorative. */}
        <span className="sr-only">{text}</span>
        <span aria-hidden>
          <span>{text.slice(0, n)}</span>
          <span className="chat-rest invisible">{text.slice(n)}</span>
        </span>
      </p>
      {meta && <span className="mt-1.5 px-2 font-mono text-[13px] text-graphite">{meta}</span>}
    </div>
  )
}
