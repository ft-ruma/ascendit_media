import Link from 'next/link'
import type { Settings } from '@/lib/types'
import { Wordmark } from './Wordmark'

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear()
  return (
    <footer className="mx-auto mt-24 max-w-[1536px] px-4 lg:px-6">
      <div className="grid gap-10 rounded-window border border-hairline bg-window p-6 shadow-window sm:p-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="grid content-start gap-4">
          <Wordmark className="h-7 w-auto" />
          <p className="max-w-[34ch] text-[15px] text-ink">Retail design, software, web and brand. One studio, one system, from the floor plan to the first sale.</p>
          <p className="text-[14px] text-graphite">
            {settings.office.line1}, {settings.office.city}, {settings.office.country}
          </p>
        </div>
        <FooterCol title="Services" links={[['Retail design', '/services/retail-design'], ['Software', '/services/software'], ['Web', '/services/web'], ['Brand & content', '/services/brand']]} />
        <FooterCol title="Products" links={[['Ascendit POS', '/products/pos'], ['Ascendit CRM', '/products/crm'], ['CareSuite', '/products/caresuite'], ['All products', '/products']]} />
        <FooterCol title="Studio" links={[['Work', '/work'], ['Studio', '/studio'], ['Careers', '/careers'], ['Contact', '/contact'], ['Start a project', '/start']]} />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2 py-6 text-[13px] text-graphite">
        <span>© {year} Ascendit Media</span>
        <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
        <a href={`mailto:${settings.email}`} className="hover:text-ink">{settings.email}</a>
        <span className="ml-auto flex gap-4">
          {settings.socials.map((s) => (
            <a key={s.url} href={s.url} className="hover:text-ink" rel="noopener" target="_blank">{s.label}</a>
          ))}
        </span>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <nav aria-label={title}>
      <h2 className="eyebrow mb-3">{title}</h2>
      <ul className="grid gap-2 text-[15px]">
        {links.map(([l, h]) => (
          <li key={h}><Link href={h} className="text-ink hover:underline underline-offset-4">{l}</Link></li>
        ))}
      </ul>
    </nav>
  )
}
