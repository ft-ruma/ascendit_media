'use client'
import { create } from 'zustand'
import type { Currency } from './types'

// Prices render in both currencies in the static HTML; a blocking head script
// sets <html data-currency> from the cookie the middleware wrote, so the first
// paint already shows the right one and pages stay static and cacheable.
export const CURRENCY_COOKIE = 'currency'

export function formatMoney(n: number, cur: Currency, compact = false) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: cur,
    currencyDisplay: cur === 'LKR' ? 'code' : 'narrowSymbol',
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(n)
}

/** "From" prices round to the nearest LKR 5,000 or USD 50. */
export function roundFrom(n: number, cur: Currency) {
  const step = cur === 'LKR' ? 5000 : 50
  return Math.max(step, Math.round(n / step) * step)
}

function readInitial(): Currency {
  if (typeof document === 'undefined') return 'USD'
  return document.documentElement.dataset.currency === 'LKR' ? 'LKR' : 'USD'
}

type CurrencyState = { currency: Currency; setCurrency: (c: Currency) => void }

export const useCurrency = create<CurrencyState>((set) => ({
  currency: readInitial(),
  setCurrency: (currency) => {
    document.cookie = `${CURRENCY_COOKIE}=${currency}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.dataset.currency = currency
    set({ currency })
  },
}))
