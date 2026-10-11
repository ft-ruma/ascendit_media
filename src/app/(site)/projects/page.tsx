import { getCaseStudies, getHome } from '@/lib/cms'
import { Lines } from '@/lib/lines'
import { pageMeta } from '@/lib/seo'
import { ProjectNetwork } from '@/network/ProjectNetwork'
import { toNet } from '@/network/toNet'
import { PageHero, PageWindow } from '@/sections/PageWindow'
import { countNodes } from '@/network/types'

export const metadata = pageMeta({
  title: 'Ongoing & completed projects',
  description: 'Every store, system and brand Ascendit has built, ongoing and completed. Tap a node to see the project.',
  path: '/projects',
})

export default async function ProjectsPage() {
  const [cases, home] = await Promise.all([getCaseStudies(), getHome()])
  const projects = toNet(cases)
  const { network } = home
  return (
    <PageWindow file={countNodes(projects) >= network.universeAt ? 'universe.app' : 'projects.app'} wide>
      <PageHero eyebrow={network.eyebrow} title={<Lines text={network.title} />} intro={network.intro ?? undefined} />
      <section aria-label="Ongoing and completed projects" className="p-3 sm:p-6">
        <ProjectNetwork projects={projects} universeAt={network.universeAt} variant="page" />
      </section>
    </PageWindow>
  )
}
