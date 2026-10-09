import Link from 'next/link'
import { getProducts } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { AppIcon } from '@/os/AppIcon'
import { Price } from '@/os/Price'
import { PageHero, PageWindow } from '@/sections/PageWindow'

export const metadata = pageMeta({
  title: 'POS, CRM and clinic software in Sri Lanka',
  description: 'Ascendit POS, Ascendit CRM and CareSuite: business software built and supported in Sri Lanka, priced monthly in LKR or USD.',
  path: '/products',
})

export default async function ProductsHub() {
  const products = await getProducts()
  return (
    <PageWindow file="Applications" crumbs={[]}>
      <PageHero eyebrow="Products" title="Apps for the business behind the counter." intro="Built by the same team that designs the store, so the till, the CRM and the shop floor fit together." />
      <ul className="grid gap-4 p-6 sm:p-10 md:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug}>
            <Link href={`/products/${p.slug}`} className="group grid h-full content-start gap-4 rounded-window border border-hairline bg-window p-6 shadow-window transition hover:-translate-y-0.5">
              <AppIcon glyph={p.glyph} accent={p.accent} className="size-20 text-[22px]" />
              <h2 className="text-[24px] font-semibold tracking-tight text-ink group-hover:underline underline-offset-4">{p.name}</h2>
              <p className="text-[16px] text-ink/80">{p.pitch}</p>
              {p.plans[0] && (
                <p className="mt-auto text-[14px] text-graphite">
                  from <Price lkr={p.plans[0].LKR} usd={p.plans[0].USD} className="text-[17px] font-semibold text-ink" suffix=" / month" />
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </PageWindow>
  )
}
