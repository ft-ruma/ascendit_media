import { Builder } from '@/builder/Builder'
import type { RateCard, Settings } from '@/lib/types'
import { whatsappLink } from '@/lib/whatsapp'
import { Doodle } from '@/os/Doodle'
import { Window } from '@/os/Window'
import { BeatHeader } from '../BeatHeader'

export function Beat8Start({ rateCard, settings }: { rateCard: RateCard; settings: Settings }) {
  return (
    <section aria-labelledby="beat-start" className="relative mx-auto mt-24 max-w-[1536px] px-4 lg:mt-32 lg:px-6">
      <BeatHeader n={8} id="beat-start" eyebrow="Start" title={<>Get a price<br />in two minutes.</>}>
        Six short questions, a live estimate in LKR or USD, and a reply within a working day.
      </BeatHeader>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Window title="new-project.brief" bodyClassName="p-0" draggable={false}>
          <Builder rateCard={rateCard} variant="inline" />
        </Window>
        <div className="relative grid content-start gap-4">
          <Window title="other-ways.txt" delay={0.1} bodyClassName="grid gap-3 p-6">
            <a className="btn-ghost justify-between" href={whatsappLink(settings.whatsapp, '/')} target="_blank" rel="noopener">
              WhatsApp {settings.phone} <span aria-hidden>↗</span>
            </a>
            <a className="btn-ghost justify-between" href={settings.bookingUrl} target="_blank" rel="noopener">
              Book a 20-minute call <span aria-hidden>↗</span>
            </a>
            <a className="btn-ghost justify-between" href={`mailto:${settings.email}`}>
              {settings.email} <span aria-hidden>↗</span>
            </a>
          </Window>
          <Doodle shape="star" className="absolute -right-2 -top-8 hidden w-14 text-tangerine lg:block" />
        </div>
      </div>
    </section>
  )
}
