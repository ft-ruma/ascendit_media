import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import { getLegalPage } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { PageHero, PageWindow } from '@/sections/PageWindow'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = () => [{ slug: 'privacy' }, { slug: 'terms' }]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getLegalPage((await params).slug)
  return p ? pageMeta({ title: p.title, description: `${p.title} for ascendit.dev`, path: `/legal/${p.slug}` }) : {}
}

export default async function LegalPage({ params }: Props) {
  const p = await getLegalPage((await params).slug)
  if (!p) notFound()
  return (
    <PageWindow file={`${p.slug}.txt`} crumbs={[{ label: 'legal', href: `/legal/${p.slug}` }]}>
      <PageHero eyebrow={`Updated ${new Date(p.updated).toLocaleDateString('en-LK', { dateStyle: 'long' })}`} title={p.title} />
      <div className="prose-os px-6 py-10 sm:px-10">
        {Array.isArray(p.body) ? p.body.map((t, i) => <p key={i}>{t}</p>) : <RichText data={p.body as never} />}
      </div>
    </PageWindow>
  )
}
