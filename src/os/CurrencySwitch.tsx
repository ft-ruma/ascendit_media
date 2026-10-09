'use client'
import { useEffect } from 'react'
import { useCurrency } from '@/lib/currency'
import type { Currency } from '@/lib/types'

export function CurrencySwitch({ className = '' }: { className?: string }) {
  const { currency, setCurrency } = useCurrency()
  // Sync with the value the head script set before hydration.
  useEffect(() => {
    const c = document.documentElement.dataset.currency as Currency | undefined
    if (c && c !== useCurrency.getState().currency) useCurrency.setState({ currency: c })
  }, [])
  return (
    <div role="group" aria-label="Currency" className={`inline-flex rounded-pill border border-hairline bg-window p-0.5 font-mono text-xs ${className}`}>
      {(['LKR', 'USD'] as const).map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={currency === c}
          onClick={() => setCurrency(c)}
          className={`rounded-pill px-2 py-1 transition ${currency === c ? 'bg-ink text-window' : 'text-ink hover:bg-ink/5'}`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
