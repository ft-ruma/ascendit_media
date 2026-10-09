import { getSettings, getTeam, getTestimonials } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { ChatBubble } from '@/os/ChatBubble'
import { LoopVideo } from '@/os/LoopVideo'
import { Sticker } from '@/os/Sticker'
import { PageHero, PageWindow } from '@/sections/PageWindow'

export const metadata = pageMeta({
  title: 'Studio: the team behind Ascendit',
  description: 'Designers, 3D artists, engineers and producers in Nittambuwa, Sri Lanka, building stores, software and brands as one team.',
  path: '/studio',
})

export default async function StudioPage() {
  const [settings, team, testimonials] = await Promise.all([getSettings(), getTeam(), getTestimonials()])
  const facts: [string, string][] = [
    ['Company', 'Ascendit Media'],
    ['Office', `${settings.office.line1}, ${settings.office.city}, ${settings.office.country}`],
    ['Team', `${settings.stats.team} people`],
    ['Clients', `${settings.stats.clients}+`],
    ['Products', `${settings.stats.products} apps`],
    ['Email', settings.email],
  ]
  return (
    <PageWindow file="Studio">
      <PageHero eyebrow="Studio" title="One team, from floor plan to first sale." />
      <section className="grid gap-8 border-b border-hairline px-6 py-12 sm:px-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="eyebrow mb-4">A note from the founder</h2>
          <blockquote className="display text-[34px] leading-[1.15] text-ink sm:text-[44px]">“{settings.founderNote.quote}”</blockquote>
          <p className="mt-5 text-[16px] text-graphite">{settings.founderNote.name}, {settings.founderNote.role}</p>
        </div>
        <div className="overflow-hidden rounded-window border border-hairline">
          <div className="aspect-[4/5]"><LoopVideo video={settings.founderNote.video} label="Founder video (captioned)" /></div>
        </div>
      </section>
      <section aria-labelledby="team" className="border-b border-hairline px-6 py-12 sm:px-10">
        <div className="mb-8 flex items-center gap-4">
          <h2 id="team" className="display text-[40px] text-ink">The team</h2>
          <Sticker accent="lime" rotate={-4}>{settings.office.city}</Sticker>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {team.map((m) => (
            <li key={m.name + m.role} className="overflow-hidden rounded-window border border-hairline bg-paper">
              <div className="aspect-[3/4]"><LoopVideo video={m.portraitLoop} label="Portrait loop" /></div>
              <div className="p-4">
                <p className="text-[16px] font-semibold text-ink">{m.name}</p>
                <p className="text-[14px] text-graphite">{m.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="clients-say" className="grid gap-4 border-b border-hairline px-6 py-12 sm:px-10">
        <h2 id="clients-say" className="display mb-4 text-[40px] text-ink">Clients say</h2>
        {testimonials.map((t, i) => <ChatBubble key={i} text={t.quote} meta={`${t.person} · ${t.company}`} />)}
      </section>
      <section aria-labelledby="details" className="px-6 py-12 sm:px-10">
        <h2 id="details" className="eyebrow mb-4">Company details</h2>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k} className="flex gap-4 border-b border-hairline pb-3">
              <dt className="w-24 shrink-0 text-[15px] text-graphite">{k}</dt>
              <dd className="text-[15px] text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PageWindow>
  )
}
