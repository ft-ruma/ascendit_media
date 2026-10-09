import Link from 'next/link'
import { getCareers } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { PageHero, PageWindow } from '@/sections/PageWindow'

export const metadata = pageMeta({ title: 'Careers at Ascendit', description: 'Open roles at Ascendit in Nittambuwa and remote in Sri Lanka.', path: '/careers' })

export default async function CareersPage() {
  const careers = await getCareers()
  return (
    <PageWindow file="Careers">
      <PageHero eyebrow="Careers" title="Make stores, software and brands with us." intro="A small team where designers sit next to engineers and everyone sees the shop open." />
      <ul className="divide-y divide-hairline">
        {careers.length === 0 && <li className="px-6 py-10 text-[17px] text-graphite sm:px-10">No open roles right now. Send your portfolio to the studio email anyway.</li>}
        {careers.map((c) => (
          <li key={c.slug}>
            <Link href={`/careers/${c.slug}`} className="group flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-6 hover:bg-paper sm:px-10">
              <span className="text-[22px] font-semibold tracking-tight text-ink group-hover:underline underline-offset-4">{c.title}</span>
              <span className="text-[15px] text-ink/80">{c.summary}</span>
              <span className="ml-auto font-mono text-[13px] text-graphite">{c.type} · {c.location}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageWindow>
  )
}
