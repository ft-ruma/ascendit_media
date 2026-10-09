import { Suspense } from 'react'
import { getCaseStudies } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { CaseGrid } from '@/sections/CaseGrid'
import { PageHero, PageWindow } from '@/sections/PageWindow'
import { WorkIndex } from '@/sections/WorkIndex'

export const metadata = pageMeta({
  title: 'Work: retail stores, software and websites',
  description: 'Case studies from Ascendit: store designs, POS and CRM rollouts, websites and launches in Sri Lanka and abroad.',
  path: '/work',
})

export default async function WorkPage() {
  const cases = await getCaseStudies()
  const industries = [...new Set(cases.map((c) => c.industry))].sort()
  return (
    <PageWindow file="Work" wide>
      <PageHero eyebrow="Work" title="Stores, systems and launches." intro="Filter by service, industry or where the client is. Every case has the numbers that mattered to the client." />
      <div className="p-6 sm:p-10">
        {/* Filters live in the URL (?service=retail&industry=Grocery&where=LK) so they can be shared. */}
        <Suspense fallback={<CaseGrid cases={cases} />}>
          <WorkIndex cases={cases} industries={industries} />
        </Suspense>
      </div>
    </PageWindow>
  )
}
