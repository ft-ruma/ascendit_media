import type { Currency } from './types'

export function formatMoneyStatic(n: number, cur: Currency) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: cur,
    currencyDisplay: cur === 'LKR' ? 'code' : 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(n)
}

/** Runs in <head> before paint. Kept tiny and dependency-free. */
export const CURRENCY_BOOT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )currency=(LKR|USD)/);document.documentElement.dataset.currency=m?m[1]:'USD'}catch(e){}})()`

/** Adds the boot cover before first paint on the first visit, so the page never flashes before the wordmark. */
export const BOOT_SCRIPT = `(function(){try{if(!sessionStorage.getItem('ascendit-booted')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('booting')}catch(e){}})()`
