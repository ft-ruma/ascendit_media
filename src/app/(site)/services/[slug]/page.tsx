import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCaseStudies, getPillar, getPillars, getSettings } from '@/lib/cms'
import { accentSoft } from '@/lib/pillars'
import { breadcrumbs, pageMeta, serviceJsonLd } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { Doodle } from '@/os/Doodle'
import { Footage } from '@/os/Footage'
import { JsonLd } from '@/os/JsonLd'
import { Price } from '@/os/Price'
import { StartButton } from '@/os/StartButton'
import { CaseGrid } from '@/sections/CaseGrid'
import { PageHero, PageWindow } from '@/sections/PageWindow'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPillars()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPillar((await params).slug)
  if (!p) return {}
  return pageMeta({ title: p.seo?.title || p.h1, description: p.seo?.description || p.intro, path: `/services/${p.slug}`, image: p.seo?.image?.url })
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const [p, pillars, cases, settings] = await Promise.all([getPillar(slug), getPillars(), getCaseStudies(), getSettings()])
  if (!p) notFound()
  const related = cases.filter((c) => c.pillars.includes(p.key))
  const retail = p.key === 'retail'

  return (
    <PageWindow file={`${p.slug}.app`} crumbs={[{ label: 'services', href: `/services/${p.slug}` }]} accent={p.accent} wide={retail}>
      <JsonLd data={serviceJsonLd(p)} />
      <JsonLd data={breadcrumbs([{ name: 'Services', path: '/services/retail-design' }, { name: p.name, path: `/services/${p.slug}` }])} />

      <nav aria-label="Services" className="flex gap-1 overflow-x-auto border-b border-hairline px-4 py-2 sm:px-8">
        {pillars.map((x) => (
          <Link
            key={x.slug}
            href={`/services/${x.slug}`}
            aria-current={x.slug === p.slug ? 'page' : undefined}
            className={`shrink-0 rounded-pill px-3 py-1.5 text-[14px] ${x.slug === p.slug ? 'bg-ink text-window' : 'text-ink hover:bg-paper'}`}
          >
            {x.name}
          </Link>
        ))}
      </nav>

      <PageHero eyebrow={p.name} title={p.h1} intro={p.intro}>
        <div className="flex flex-wrap items-center gap-3">
          <StartButton source={`service-${p.key}`} pillar={p.key} className="btn-aqua h-12 px-7 text-[16px]">
            {retail ? 'Book a store consultation' : `Start a ${p.name.toLowerCase()} project`}
          </StartButton>
          <a className="btn-ghost h-12" href={whatsappLink(settings.whatsapp, `/services/${p.slug}`)} target="_blank" rel="noopener">
            WhatsApp us
          </a>
          <span className="text-[15px] text-graphite">
            from <Price lkr={p.fromPriceLKR} usd={p.fromPriceUSD} className="font-semibold text-ink" />
          </span>
        </div>
      </PageHero>

      {retail && (
        <section aria-labelledby="walkthrough" className="border-b border-hairline p-4 sm:p-8">
          <h2 id="walkthrough" className="sr-only">Store walkthrough</h2>
          <div className="overflow-hidden rounded-window border border-hairline">
            <div className="flex h-9 items-center justify-center border-b border-hairline bg-paper font-mono text-[13px] text-graphite">walkthrough.mov<span className="lg:hidden">&nbsp;· vertical</span></div>
            <div className="aspect-[21/9] max-lg:aspect-[9/16] max-lg:max-h-[78svh]"><Footage label="3D walkthrough of a finished store design" tone="plaster" /></div>
          </div>
        </section>
      )}

      <section aria-labelledby="caps" className={`grid gap-8 border-b border-hairline px-6 py-12 sm:px-10 lg:grid-cols-[1fr_2fr] ${accentSoft[p.accent]}`}>
        <h2 id="caps" className="display text-[40px] text-ink">What we do</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {p.capabilities.map((c) => (
            <li key={c} className="rounded-xl border border-ink/10 bg-window p-4 text-[16px] text-ink">{c}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="process" className="border-b border-hairline px-6 py-12 sm:px-10">
        <h2 id="process" className="display relative mb-8 inline-block text-[40px] text-ink">
          How it works
          <Doodle shape="underline" className="absolute -bottom-2 left-0 w-full text-tangerine" />
        </h2>
        <ol className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {p.process.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-hairline bg-paper p-5">
              <span className="font-mono text-[13px] text-graphite">0{i + 1}</span>
              <h3 className="mt-1 text-[18px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-[15px] text-ink/80">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {retail && (
        <section aria-labelledby="renders" className="border-b border-hairline px-6 py-12 sm:px-10">
          <h2 id="renders" className="display mb-8 text-[40px] text-ink">Render gallery</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {['Grocery flagship, entrance', 'Pharmacy counter', 'Boutique fitting area', 'Hardware aisle', 'Café counter', 'Mall kiosk'].map((l, i) => (
              <li key={l} className={`overflow-hidden rounded-xl border border-hairline ${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}>
                <div className={i === 0 ? 'aspect-square sm:aspect-auto sm:h-full' : 'aspect-[4/3]'}><Footage label={l} tone={i % 2 ? 'paper' : 'plaster'} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="tools" className="flex flex-wrap items-center gap-3 border-b border-hairline px-6 py-8 sm:px-10">
        <h2 id="tools" className="eyebrow mr-2">Tools</h2>
        {p.tools.map((t) => <span key={t} className="rounded-pill border border-hairline px-3 py-1 font-mono text-[13px] text-ink">{t}</span>)}
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related" className="border-b border-hairline px-6 py-12 sm:px-10">
          <h2 id="related" className="display mb-8 text-[40px] text-ink">{p.name} work</h2>
          <CaseGrid cases={related.slice(0, 3)} />
        </section>
      )}

      <section className="grid gap-4 px-6 py-12 text-center sm:px-10">
        <p className="display text-[40px] text-ink sm:text-[52px]">{retail ? 'Opening a store?' : 'Have a project in mind?'}</p>
        <div className="flex justify-center">
          <StartButton source={`service-${p.key}-footer`} pillar={p.key} className="btn-aqua h-12 px-7 text-[16px]">
            Get an estimate
          </StartButton>
        </div>
      </section>
    </PageWindow>
  )
}
