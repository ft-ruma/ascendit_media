import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct, getProducts } from '@/lib/cms'
import { breadcrumbs, pageMeta, productJsonLd } from '@/lib/seo'
import { AppIcon } from '@/os/AppIcon'
import { JsonLd } from '@/os/JsonLd'
import { LoopVideo } from '@/os/LoopVideo'
import { Price } from '@/os/Price'
import { LeadForm } from '@/sections/LeadForm'
import { PageWindow } from '@/sections/PageWindow'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug)
  if (!p) return {}
  return pageMeta({ title: p.seo?.title || `${p.name}: ${p.audience.split(',')[0]} software in Sri Lanka`, description: p.seo?.description || p.pitch, path: `/products/${p.slug}` })
}

export default async function ProductPage({ params }: Props) {
  const p = await getProduct((await params).slug)
  if (!p) notFound()

  return (
    <PageWindow file={`${p.slug}.app`} crumbs={[{ label: 'products', href: '/products' }]} accent={p.accent}>
      <JsonLd data={productJsonLd(p)} />
      <JsonLd data={breadcrumbs([{ name: 'Products', path: '/products' }, { name: p.name, path: `/products/${p.slug}` }])} />

      <header className="grid gap-8 border-b border-hairline px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:py-16">
        <div className="grid content-start gap-5">
          <AppIcon glyph={p.glyph} accent={p.accent} className="size-20 text-[22px]" />
          <h1 className="display text-[52px] text-ink sm:text-[72px]">{p.name}</h1>
          <p className="max-w-[48ch] text-[19px] leading-relaxed text-ink/85">{p.pitch}</p>
          <p className="text-[15px] text-graphite">For {p.audience.charAt(0).toLowerCase() + p.audience.slice(1)}</p>
          <div className="flex flex-wrap gap-3">
            <a href="#demo" className="btn-aqua h-12 px-7 text-[16px]">Book a demo</a>
            <a href="#plans" className="btn-ghost h-12">See plans</a>
          </div>
        </div>
        <div className="overflow-hidden rounded-window border border-hairline shadow-window">
          <div className="flex h-9 items-center justify-center border-b border-hairline bg-paper font-mono text-[13px] text-graphite">screen-recording.mov</div>
          <div className="aspect-[4/3]"><LoopVideo video={p.screenRecording} label={`${p.name} screen recording`} /></div>
        </div>
      </header>

      <section aria-labelledby="features" className="border-b border-hairline px-6 py-12 sm:px-10">
        <h2 id="features" className="display mb-8 text-[40px] text-ink">What it does</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {p.features.map((f) => (
            <li key={f.title} className="rounded-2xl border border-hairline bg-paper p-5">
              <h3 className="text-[17px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-[15px] text-ink/80">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="plans" aria-labelledby="plans-title" className="scroll-mt-16 border-b border-hairline px-6 py-12 sm:px-10">
        <h2 id="plans-title" className="display mb-8 text-[40px] text-ink">Plans</h2>
        <ul className={`grid gap-4 ${p.plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {p.plans.map((pl) => (
            <li key={pl.name} className={`relative grid gap-3 rounded-window border p-6 ${pl.highlight ? 'border-aqua bg-window shadow-[0_0_0_1px_var(--color-aqua),var(--shadow-window)]' : 'border-hairline bg-window shadow-window'}`}>
              {pl.highlight && <span className="absolute -top-3 left-6 rounded-pill bg-lime px-2.5 py-0.5 text-[12px] font-medium text-ink">Most popular</span>}
              <h3 className="text-[20px] font-semibold text-ink">{pl.name}</h3>
              <p><Price lkr={pl.LKR} usd={pl.USD} className="text-[34px] font-semibold tracking-tight text-ink" suffix=" / month" /></p>
              <p className="text-[14px] text-graphite">
                Setup <Price lkr={pl.setupLKR} usd={pl.setupUSD} className="text-ink" /> once · save {pl.yearlyDiscountPct}% paid yearly
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="border-b border-hairline px-6 py-12 sm:px-10">
        <h2 id="faq" className="display mb-6 text-[40px] text-ink">FAQ</h2>
        <div className="grid gap-2">
          {p.faq.map((f) => (
            <details key={f.q} className="group rounded-xl border border-hairline bg-paper px-5 py-4">
              <summary className="cursor-pointer list-none text-[17px] font-medium text-ink marker:hidden">
                <span className="mr-2 inline-block font-mono text-graphite transition group-open:rotate-45">+</span>{f.q}
              </summary>
              <p className="mt-2 pl-6 text-[16px] text-ink/85">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="demo" aria-labelledby="demo-title" className="grid scroll-mt-16 gap-6 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 id="demo-title" className="display text-[40px] text-ink">Book a demo</h2>
          <p className="mt-3 text-[16px] text-ink/80">A 30-minute walkthrough on your own products and prices. No slides.</p>
        </div>
        <LeadForm
          type="demo"
          extra={{ product: p.slug }}
          fields={[{ name: 'company', label: 'Business name', autoComplete: 'organization', optional: true }, { name: 'message', label: 'Anything we should know?', type: 'textarea', optional: true }]}
          submitLabel="Request demo"
          successTitle="Demo requested."
        />
      </section>
    </PageWindow>
  )
}
