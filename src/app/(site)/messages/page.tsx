import { getSettings, getTestimonials } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { MessagesThread } from '@/phone/MessagesThread'
import { PageHero, PageWindow } from '@/sections/PageWindow'

export const metadata = {
  ...pageMeta({ title: 'Messages from clients', description: 'What Ascendit clients say about working with us.', path: '/messages' }),
  // Same testimonials as /studio; keep one indexed copy.
  robots: { index: false, follow: true },
}

export default async function MessagesPage() {
  const [testimonials, settings] = await Promise.all([getTestimonials(), getSettings()])
  const messages = testimonials.flatMap((t, i) => [
    { from: 'them' as const, text: t.quote, meta: `${t.person} · ${t.company}` },
    ...(i === 0 ? [{ from: 'us' as const, text: 'Thank you! See you at the first anniversary sale ٩(◕‿◕)۶' }] : []),
  ])
  return (
    <PageWindow file="Messages">
      <PageHero eyebrow="Messages" title="Messages" intro="From clients, in their own words." />
      <section aria-label="Client messages" className="px-6 py-10 sm:px-10">
        <MessagesThread messages={messages} />
      </section>
      <section className="flex flex-wrap items-center justify-between gap-3 px-6 py-6 sm:px-10">
        <p className="text-[16px] text-ink">Want to be in this thread?</p>
        <a href={whatsappLink(settings.whatsapp, '/messages')} target="_blank" rel="noopener" className="btn-aqua h-12 px-6">Message us on WhatsApp</a>
      </section>
    </PageWindow>
  )
}
