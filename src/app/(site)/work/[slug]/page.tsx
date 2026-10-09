import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCaseStudies, getCaseStudy } from '@/lib/cms'
import { PILLAR_NAMES, pillarSlug } from '@/lib/pillars'
import { breadcrumbs, caseStudyJsonLd, pageMeta } from '@/lib/seo'
import { ChatBubble } from '@/os/ChatBubble'
import { JsonLd } from '@/os/JsonLd'
import { LoopVideo } from '@/os/LoopVideo'
import { StartButton } from '@/os/StartButton'
import { PageWindow } from '@/sections/PageWindow'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getCaseStudies()).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCaseStudy((await params).slug)
  if (!c) return {}
  return pageMeta({ title: c.seo?.title || `${c.client}: ${c.result}`, description: c.seo?.description || c.brief, path: `/work/${c.slug}` })
}

export default async function CaseStudyPage({ params }: Props) {
  const c = await getCaseStudy((await params).slug)
  if (!c) notFound()
  const all = await getCaseStudies()
  const next = all[(all.findIndex((x) => x.slug === c.slug) + 1) % all.length]

  return (
    <PageWindow file={c.windowFileName} crumbs={[{ label: 'work', href: '/work' }]}>
      <JsonLd data={caseStudyJsonLd(c)} />
      <JsonLd data={breadcrumbs([{ name: 'Work', path: '/work' }, { name: c.client, path: `/work/${c.slug}` }])} />
      <article>
        <header className="grid gap-5 px-6 py-12 sm:px-10 lg:py-16">
          <p className="eyebrow">
            {c.industry} · {c.location === 'LK' ? 'Sri Lanka' : 'International'}
          </p>
          <h1 className="display max-w-[20ch] text-[46px] text-ink sm:text-[68px]">{c.client}</h1>
          <p className="max-w-[50ch] text-[22px] leading-snug text-ink">{c.result}</p>
          <ul className="flex flex-wrap gap-2">
            {c.pillars.map((p) => (
              <li key={p}><Link href={`/services/${pillarSlug(p)}`} className="rounded-pill border border-hairline px-3 py-1 text-[14px] text-ink hover:border-ink/30">{PILLAR_NAMES[p]}</Link></li>
            ))}
          </ul>
        </header>
        <div className="aspect-[21/9] border-y border-hairline"><LoopVideo video={c.video ?? c.cover} label={`${c.client} cover`} /></div>

        {c.metrics.length > 0 && (
          <dl className="grid grid-cols-2 gap-6 border-b border-hairline px-6 py-10 sm:px-10 md:grid-cols-4">
            {c.metrics.map((m) => (
              <div key={m.label}>
                <dd className="display text-[56px] text-ink tabular-nums">{m.value}<span className="text-[28px]">{m.unit}</span></dd>
                <dt className="text-[15px] text-graphite">{m.label}</dt>
              </div>
            ))}
          </dl>
        )}

        <section className="grid gap-6 border-b border-hairline px-6 py-12 sm:px-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="display text-[36px] text-ink">The brief</h2>
          <p className="max-w-[62ch] text-[18px] leading-relaxed text-ink">{c.brief}</p>
        </section>

        <section className="grid gap-6 border-b border-hairline px-6 py-12 sm:px-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="display text-[36px] text-ink">What we did</h2>
          <div className="grid gap-4">
            {c.approach.map((a) => (
              <div key={a.pillar} className="rounded-2xl border border-hairline bg-paper p-5">
                <h3 className="eyebrow mb-2">{PILLAR_NAMES[a.pillar]}</h3>
                <p className="text-[17px] leading-relaxed text-ink">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        {c.gallery.length > 0 && (
          <section aria-label="Gallery" className="grid gap-3 border-b border-hairline p-6 sm:grid-cols-2 sm:p-10">
            {c.gallery.map((g) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={g.url} src={g.url} alt={g.alt} loading="lazy" className="w-full rounded-xl border border-hairline" />
            ))}
          </section>
        )}

        {c.quote && (
          <section aria-label="Client quote" className="border-b border-hairline px-6 py-12 sm:px-10">
            <ChatBubble text={c.quote.quote} meta={`${c.quote.person} · ${c.quote.company}`} />
          </section>
        )}
      </article>

      <nav className="flex flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-10" aria-label="More work">
        <StartButton source={`case-${c.slug}`} className="btn-aqua h-12 px-7">Start something similar</StartButton>
        {next && next.slug !== c.slug && (
          <Link href={`/work/${next.slug}`} className="text-[16px] font-medium text-ink underline-offset-4 hover:underline">
            Next: {next.client} →
          </Link>
        )}
      </nav>
    </PageWindow>
  )
}
