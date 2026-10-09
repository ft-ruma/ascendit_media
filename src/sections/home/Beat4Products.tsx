import Link from 'next/link'
import type { Product } from '@/lib/types'
import { Price } from '@/os/Price'
import { StartButton } from '@/os/StartButton'
import { BeatHeader } from '../BeatHeader'
import { DockLift } from './DockLift'

/** Beat 4: the dock's product icons lift up into full windows. */
export function Beat4Products({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="beat-products" className="relative mx-auto mt-24 max-w-[1536px] px-4 lg:mt-32 lg:px-6">
      <BeatHeader n={4} id="beat-products" eyebrow="Products" title={<>Software we run<br />our clients on.</>}>
        Three apps we built for Sri Lankan businesses, priced monthly, set up by the people who made them.
      </BeatHeader>
      <ul className="grid gap-4 lg:grid-cols-3">
        {products.map((p, i) => {
          const plan = p.plans[0]
          return (
            <li key={p.slug}>
              <DockLift glyph={p.glyph} accent={p.accent} index={i}>
                <div className="flex h-10 items-center border-b border-hairline bg-gradient-to-b from-white to-paper/60 px-3">
                  <span className="mx-auto font-mono text-[13px] text-graphite">
                    <Link href={`/products/${p.slug}`} className="text-ink hover:underline underline-offset-4">{p.slug}.app</Link>
                  </span>
                </div>
                <div className="grid gap-4 p-6">
                  <h3 className="text-[24px] font-semibold tracking-tight text-ink">{p.name}</h3>
                  <p className="text-[16px] text-ink/80">{p.pitch}</p>
                  <ul className="grid gap-1.5 text-[15px] text-ink">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f.title} className="flex gap-2"><span aria-hidden className="text-graphite">✓</span>{f.title}</li>
                    ))}
                  </ul>
                  {plan && (
                    <p className="text-[14px] text-graphite">
                      from <Price lkr={plan.LKR} usd={plan.USD} className="text-[18px] font-semibold text-ink" suffix=" / month" />
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <StartButton source={`home-product-${p.slug}`} product={p.slug as never} className="btn-aqua h-10 px-5 text-[14px]">Book a demo</StartButton>
                    <Link href={`/products/${p.slug}`} className="btn-ghost h-10 px-5 text-[14px]">Plans & FAQ</Link>
                  </div>
                </div>
              </DockLift>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
