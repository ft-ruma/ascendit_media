'use client'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

const KEY = 'ascendit-note-typed'

/** Types the letter out with a caret on first view; the full text is always in the HTML for search and screen readers. */
export function TypedNote({ text }: { text: string }) {
  const [n, setN] = useState(text.length)
  const [typing, setTyping] = useState(false)
  const reduced = useReducedMotion()
  const started = useRef(false)

  useEffect(() => {
    if (started.current || reduced) return
    started.current = true
    try {
      if (sessionStorage.getItem(KEY)) return
      sessionStorage.setItem(KEY, '1')
    } catch {
      return
    }
    setN(0)
    setTyping(true)
    let i = 0
    const t = setInterval(() => {
      i += 2
      setN(Math.min(i, text.length))
      if (i >= text.length) {
        clearInterval(t)
        setTyping(false)
      }
    }, 22)
    return () => clearInterval(t)
  }, [reduced, text])

  return (
    <p className="text-[19px] leading-[1.7] text-ink">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, n)}
        <span className="caret" />
        <span className="chat-rest invisible">{text.slice(n)}</span>
      </span>
    </p>
  )
}
