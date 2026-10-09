import type { Settings, Testimonial } from '@/lib/types'
import { ChatBubble } from '@/os/ChatBubble'
import { Window } from '@/os/Window'
import { BeatHeader } from '../BeatHeader'

export function Beat6Proof({ testimonials, settings }: { testimonials: Testimonial[]; settings: Settings }) {
  const stats = [
    { v: `${settings.stats.clients}+`, l: 'clients' },
    { v: settings.stats.years, l: 'years' },
    { v: settings.stats.team, l: 'people' },
    { v: settings.stats.products, l: 'products' },
  ]
  return (
    <section aria-labelledby="beat-proof" className="relative mx-auto mt-24 max-w-[1536px] px-4 lg:mt-32 lg:px-6">
      <BeatHeader n={6} id="beat-proof" eyebrow="Proof" title={<>In their<br />words.</>} />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Window title="messages · clients" bodyClassName="grid gap-5 p-6 sm:p-8">
          {testimonials.slice(0, 3).map((t, i) => (
            <div key={i} className="grid gap-2">
              <ChatBubble text={t.quote} meta={`${t.person}${t.role ? `, ${t.role}` : ''} · ${t.company}`} />
              {i === 0 && <ChatBubble from="us" text="Thank you! See you at the first anniversary sale." />}
            </div>
          ))}
        </Window>
        <Window title="about-this-studio" delay={0.1} bodyClassName="p-6 sm:p-8">
          <dl className="grid grid-cols-2 gap-6">
            {stats.map((s) => (
              <div key={s.l}>
                <dd className="display text-[64px] text-ink tabular-nums">{s.v}</dd>
                <dt className="text-[15px] text-graphite">{s.l}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-8 rounded-xl bg-lime/60 p-4 text-[15px] text-ink">
            Every brief gets a reply within one working day, usually the same day on WhatsApp.
          </p>
        </Window>
      </div>
    </section>
  )
}
