import { getSettings } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { StartButton } from '@/os/StartButton'
import { LeadForm } from '@/sections/LeadForm'
import { PageHero, PageWindow } from '@/sections/PageWindow'

export const metadata = pageMeta({ title: 'Contact Ascendit', description: 'WhatsApp, book a call, email or visit the Ascendit studio in Nittambuwa, Sri Lanka.', path: '/contact' })

export default async function ContactPage() {
  const s = await getSettings()
  return (
    <PageWindow file="Contact">
      <PageHero eyebrow="Contact" title="Say hello." intro="The fastest way is WhatsApp. For a price, the project builder takes two minutes.">
        <div className="flex flex-wrap gap-3">
          <a className="btn-aqua h-12 px-7" href={whatsappLink(s.whatsapp, '/contact')} target="_blank" rel="noopener">WhatsApp {s.phone}</a>
          <StartButton source="contact" className="btn-ghost h-12">Start a project</StartButton>
        </div>
      </PageHero>
      <div className="grid gap-0 lg:grid-cols-2">
        <section aria-labelledby="book" className="border-b border-hairline px-6 py-10 sm:px-10 lg:border-r">
          <h2 id="book" className="display mb-4 text-[36px] text-ink">Book a call</h2>
          <div className="overflow-hidden rounded-window border border-hairline">
            <iframe title="Book a call" src={s.bookingUrl} loading="lazy" className="h-[560px] w-full bg-window" />
          </div>
          <p className="mt-3 text-[14px] text-graphite">
            Not loading? <a className="text-aqua-deep underline underline-offset-4" href={s.bookingUrl} target="_blank" rel="noopener">Open the booking page</a>.
          </p>
        </section>
        <section aria-labelledby="msg" className="border-b border-hairline px-6 py-10 sm:px-10">
          <h2 id="msg" className="display mb-4 text-[36px] text-ink">Send a message</h2>
          <LeadForm type="contact" fields={[{ name: 'company', label: 'Company', optional: true, autoComplete: 'organization' }, { name: 'message', label: 'Message', type: 'textarea' }]} />
        </section>
      </div>
      <section aria-labelledby="visit" className="grid gap-2 px-6 py-10 sm:px-10">
        <h2 id="visit" className="eyebrow">Visit</h2>
        <p className="text-[18px] text-ink">{s.office.line1}, {s.office.city}, {s.office.country}</p>
        <p className="text-[16px]"><a className="text-aqua-deep underline underline-offset-4" href={s.office.mapUrl} target="_blank" rel="noopener">Open in Maps</a> · <a className="text-aqua-deep underline underline-offset-4" href={`mailto:${s.email}`}>{s.email}</a></p>
      </section>
    </PageWindow>
  )
}
