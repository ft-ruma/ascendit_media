import { getCaseStudies, getHome } from '@/lib/cms'
import { Lines } from '@/lib/lines'
import { pageMeta } from '@/lib/seo'
import { ProjectNetwork } from '@/network/ProjectNetwork'
import { toNet } from '@/network/toNet'
import { PageHero, PageWindow } from '@/sections/PageWindow'

export const metadata = pageMeta({
  title: 'Our project network',
  description: 'Every store, system and brand Ascendit has built, as one growing network. Tap a node to see the project.',
  path: '/network',
})

export default async function NetworkPage() {
  const [cases, home] = await Promise.all([getCaseStudies(), getHome()])
  const projects = toNet(cases)
  const { network } = home
  return (
    <PageWindow file={projects.length >= network.universeAt ? 'universe.app' : 'network.app'} wide>
      <PageHero eyebrow={network.eyebrow} title={<Lines text={network.title} />} intro={network.intro ?? undefined} />
      <section aria-label="Project network" className="p-3 sm:p-6">
        <ProjectNetwork projects={projects} universeAt={network.universeAt} variant="page" />
      </section>
    </PageWindow>
  )
}
