import { Lines } from '@/lib/lines'
import type { BeatCopy } from '@/lib/types'
import { LazyNetwork } from '@/network/LazyNetwork'
import type { NetProject } from '@/network/ProjectNetwork'
import { Window } from '@/os/Window'
import { BeatHeader } from '../BeatHeader'

/** Home beat: every project as a node in a growing network (a universe after the threshold). */
export function BeatNetwork({ copy, projects, universeAt }: { copy: BeatCopy; projects: NetProject[]; universeAt: number }) {
  return (
    <section aria-labelledby="beat-network" className="relative mx-auto mt-24 max-w-[1536px] px-4 lg:mt-32 lg:px-6">
      <BeatHeader n={6} id="beat-network" eyebrow={copy.eyebrow} title={<Lines text={copy.title} />}>
        {copy.intro}
      </BeatHeader>
      <Window title={projects.length >= universeAt ? 'universe.app' : 'network.app'} href="/network" bodyClassName="p-3 sm:p-4" draggable={false}>
        <LazyNetwork projects={projects} universeAt={universeAt} />
      </Window>
    </section>
  )
}
