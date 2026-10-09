import Link from 'next/link'
import type { Settings, TeamMember } from '@/lib/types'
import { LoopVideo } from '@/os/LoopVideo'
import { Sticker } from '@/os/Sticker'
import { Window } from '@/os/Window'
import { BeatHeader } from '../BeatHeader'

export function Beat7Studio({ settings, team }: { settings: Settings; team: TeamMember[] }) {
  return (
    <section aria-labelledby="beat-studio" className="relative mx-auto mt-24 max-w-[1536px] px-4 lg:mt-32 lg:px-6">
      <BeatHeader n={7} id="beat-studio" eyebrow="Studio" title={<>Small team.<br />Whole system.</>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Window title="founder-note.txt" href="/studio" bodyClassName="p-6 sm:p-8">
          <blockquote className="display text-[30px] leading-[1.15] text-ink sm:text-[36px]">“{settings.founderNote.quote}”</blockquote>
          <p className="mt-5 text-[15px] text-graphite">
            {settings.founderNote.name}, {settings.founderNote.role}
          </p>
        </Window>
        <Window title="team" delay={0.1} bodyClassName="p-4 sm:p-6" toolbar={<Link href="/studio" className="font-mono text-[12px] text-ink underline-offset-4 hover:underline">Studio →</Link>}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {team.slice(0, 8).map((m) => (
              <li key={m.name + m.role} className="overflow-hidden rounded-xl border border-hairline bg-paper">
                <div className="aspect-[3/4]">
                  <LoopVideo video={m.portraitLoop} label="Portrait loop" />
                </div>
                <div className="p-2.5">
                  <p className="text-[14px] font-medium text-ink">{m.name}</p>
                  <p className="text-[13px] text-graphite">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <Sticker accent="lilac" rotate={-3}>{settings.office.city} office</Sticker>
          </div>
        </Window>
      </div>
    </section>
  )
}
