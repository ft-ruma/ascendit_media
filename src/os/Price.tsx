import { formatMoneyStatic } from '@/lib/currency-shared'

/** Renders both currencies; CSS shows the one in <html data-currency>. Static-cache friendly. */
export function Price({ lkr, usd, suffix, className = '' }: { lkr: number; usd: number; suffix?: string; className?: string }) {
  return (
    <span className={`tabular-nums ${className}`}>
      <span data-cur="LKR">{formatMoneyStatic(lkr, 'LKR')}</span>
      <span data-cur="USD">{formatMoneyStatic(usd, 'USD')}</span>
      {suffix && <span className="text-graphite">{suffix}</span>}
    </span>
  )
}
