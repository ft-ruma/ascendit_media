import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCareer, getCareers } from '@/lib/cms'
import { breadcrumbs, pageMeta } from '@/lib/seo'
import { JsonLd } from '@/os/JsonLd'
import { LeadForm } from '@/sections/LeadForm'
import { PageHero, PageWindow } from '@/sections/PageWindow'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getCareers()).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCareer((await params).slug)
  return c ? pageMeta({ title: `${c.title} · Careers`, description: c.summary, path: `/careers/${c.slug}` }) : {}
}

export default async function CareerPage({ params }: Props) {
  const c = await getCareer((await params).slug)
  if (!c) notFound()
  return (
    <PageWindow file={`${c.slug}.txt`} crumbs={[{ label: 'careers', href: '/careers' }]}>
      <JsonLd data={breadcrumbs([{ name: 'Careers', path: '/careers' }, { name: c.title, path: `/careers/${c.slug}` }])} />
      <PageHero eyebrow={`${c.type} · ${c.location}`} title={c.title} intro={c.summary} />
      <div className="prose-os border-b border-hairline px-6 py-10 sm:px-10">
        {c.description.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <section aria-labelledby="apply" className="px-6 py-10 sm:px-10">
        <h2 id="apply" className="display mb-6 text-[40px] text-ink">Apply</h2>
        <LeadForm
          type="career"
          extra={{ role: c.title }}
          fields={[{ name: 'portfolio', label: 'Portfolio or CV link', type: 'url' }, { name: 'message', label: 'Why this role?', type: 'textarea' }]}
          submitLabel="Send application"
          successTitle="Application sent."
        />
      </section>
    </PageWindow>
  )
}
