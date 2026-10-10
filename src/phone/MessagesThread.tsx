'use client'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

type Msg = { from: 'them' | 'us'; text: string; meta?: string }

/**
 * A messages-style thread. Every bubble is in the HTML; once JS runs they
 * appear one at a time after a typing indicator (instantly under reduced motion).
 */
export function MessagesThread({ messages }: { messages: Msg[] }) {
  const [shown, setShown] = useState(messages.length)
  const [typing, setTyping] = useState<'them' | 'us' | null>(null)
  const ref = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return setShown(messages.length)
    setShown(0)
    let cancelled = false
    let n = 0
    const run = () => {
      if (cancelled || n >= messages.length) return setTyping(null)
      setTyping(messages[n].from)
      setTimeout(() => {
        if (cancelled) return
        n += 1
        setShown(n)
        setTyping(null)
        setTimeout(run, 380)
      }, Math.min(1400, 500 + messages[n].text.length * 9))
    }
    const t = setTimeout(run, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [messages, reduced])

  useEffect(() => {
    ref.current?.lastElementChild?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [shown, typing])

  return (
    <ol ref={ref} className="msg-seq grid gap-2.5" aria-live="polite">
      {messages.map((m, i) => (
        <li key={i} data-msg {...(i < shown ? { 'data-shown': '' } : {})} className={`flex flex-col ${m.from === 'us' ? 'items-end' : 'items-start'}`}>
          <p
            className={`max-w-[80%] rounded-[22px] px-4 py-2.5 text-[16px] leading-snug shadow-[inset_0_1px_0_rgb(255_255_255/.7),0_8px_18px_-12px_rgb(14_14_18/.35)] ${
              m.from === 'us' ? 'rounded-br-md bg-gradient-to-b from-[#2F6FEA] to-aqua-deep text-white' : 'rounded-bl-md border border-hairline bg-gradient-to-b from-white to-[#EEF0F3] text-ink'
            }`}
          >
            {m.text}
          </p>
          {m.meta && <span className="mt-1 px-2 font-mono text-[12px] text-graphite">{m.meta}</span>}
        </li>
      ))}
      {typing && (
        <li className={`flex ${typing === 'us' ? 'justify-end' : 'justify-start'}`} aria-label="Typing">
          <span className="flex gap-1 rounded-[22px] border border-hairline bg-window px-4 py-3.5">
            {[0, 1, 2].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-graphite/60" style={{ animationDelay: `${d * 0.15}s` }} />)}
          </span>
        </li>
      )}
    </ol>
  )
}
