'use client'
import { useEffect } from 'react'
import { useCurrency } from '@/lib/currency'
import { contactSchema } from './schema'
import { useBuilder } from './store'

const IDLE_MS = 60_000

/**
 * Partial leads: once the contact step has a valid email or WhatsApp and the
 * visitor leaves (tab hidden or 60 s idle), send what we have as "unfinished".
 * Sent once per contact value so a return visit does not duplicate it.
 */
export function usePartialLead(active: boolean) {
  useEffect(() => {
    if (!active) return
    let idle: ReturnType<typeof setTimeout>

    const send = () => {
      const { draft, status, partialKey, markPartial, source } = useBuilder.getState()
      if (status !== 'editing') return
      const c = draft.contact
      const emailOk = contactSchema.shape.email.safeParse(c.email).success
      const waOk = contactSchema.shape.whatsapp.safeParse(c.whatsapp).success
      if (!emailOk && !waOk) return
      const key = `${c.email ?? ''}|${c.whatsapp ?? ''}`
      if (partialKey === key) return
      const body = JSON.stringify({
        type: 'builder',
        status: 'unfinished',
        answers: draft,
        contact: { ...c, email: emailOk ? c.email : undefined, whatsapp: waOk ? c.whatsapp : undefined },
        currency: useCurrency.getState().currency,
        source,
        page: location.pathname,
      })
      if (navigator.sendBeacon?.('/api/lead', new Blob([body], { type: 'application/json' }))) markPartial(key)
    }

    const resetIdle = () => {
      clearTimeout(idle)
      idle = setTimeout(send, IDLE_MS)
    }
    const onVis = () => document.visibilityState === 'hidden' && send()

    resetIdle()
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', send)
    for (const ev of ['keydown', 'pointerdown', 'input'] as const) window.addEventListener(ev, resetIdle, { passive: true })
    return () => {
      clearTimeout(idle)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', send)
      for (const ev of ['keydown', 'pointerdown', 'input'] as const) window.removeEventListener(ev, resetIdle)
    }
  }, [active])
}
