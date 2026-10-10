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
export const BOOT_SCRIPT = `(function(){try{if(innerWidth>=1024&&!sessionStorage.getItem('ascendit-booted')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('booting')}catch(e){}})()`

/**
 * Phone/tablet pre-paint flags, as data attributes React never touches:
 * data-js (sequenced content may hide until revealed), data-reduce-motion (in-site
 * toggle), data-lock (lock screen once per session, under 1024px only).
 */
export const PHONE_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.setAttribute('data-js','');try{var c=JSON.parse(localStorage.getItem('ascendit-comfort')||'{}');if(c.state&&c.state.reduceMotion)d.setAttribute('data-reduce-motion','')}catch(e){}try{if(innerWidth<1024&&!sessionStorage.getItem('ascendit-unlocked'))d.setAttribute('data-lock','')}catch(e){}})()`
