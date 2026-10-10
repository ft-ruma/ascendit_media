import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { draftMode } from 'next/headers'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { BuilderModal } from '@/builder/BuilderModal'
import { getCaseStudies, getProducts, getRateCard, getSettings } from '@/lib/cms'
import { BOOT_SCRIPT, CURRENCY_BOOT_SCRIPT, PHONE_BOOT_SCRIPT } from '@/lib/currency-shared'
import { whatsappLink } from '@/lib/whatsapp'
import { organizationJsonLd, SITE_URL } from '@/lib/seo'
import { Boot } from '@/os/Boot'
import { Dock } from '@/os/Dock'
import { Footer } from '@/os/Footer'
import { JsonLd } from '@/os/JsonLd'
import { LivePreview } from '@/os/LivePreview'
import { MenuBar } from '@/os/MenuBar'
import { MotionProvider } from '@/os/MotionProvider'
import { ZoomOverlay } from '@/os/ZoomOverlay'
import { LockScreen } from '@/phone/LockScreen'
import { PhoneDock } from '@/phone/PhoneDock'
import { PhoneShell } from '@/phone/PhoneShell'
import { StatusBar } from '@/phone/StatusBar'
import '@/styles/globals.css'

const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist', adjustFontFallback: true })
const geistMono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-geist-mono' })
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', display: 'swap', variable: '--font-instrument-serif' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Ascendit: retail design, software and web from one studio in Sri Lanka', template: '%s · Ascendit' },
  description:
    'Ascendit designs retail stores, builds POS, CRM and custom software, and makes websites and brands, from one studio in Nittambuwa, Sri Lanka.',
  openGraph: { type: 'website', siteName: 'Ascendit', locale: 'en_LK' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
}

// viewportFit=cover lets the phone status bar and dock use env(safe-area-inset-*).
export const viewport: Viewport = { themeColor: '#F4F4F1', colorScheme: 'light', viewportFit: 'cover' }

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, products, rateCard, cases, draft] = await Promise.all([getSettings(), getProducts(), getRateCard(), getCaseStudies(), draftMode()])
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  const latest = [...cases].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]
  const lockNotes = [
    ...(latest ? [{ app: 'WORK', tone: 'bg-tangerine text-ink', title: 'New case study', body: `${latest.client}: ${latest.result}` }] : []),
    ...(products[0] ? [{ app: products[0].glyph, tone: 'bg-lilac text-ink', title: `${products[0].name} update`, body: products[0].features[0]?.title ? `${products[0].features[0].title}: ${products[0].features[0].body}` : products[0].pitch }] : []),
    { app: 'A', tone: 'bg-lime text-ink', title: 'Ascendit', body: `${settings.stats.clients}+ businesses run on Ascendit` },
  ]
  const banner = latest ? { title: `New case study: ${latest.client}`, body: latest.result, href: `/work/${latest.slug}` } : null

  return (
    <html lang="en-LK" className={`${geist.variable} ${geistMono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CURRENCY_BOOT_SCRIPT + ';' + BOOT_SCRIPT + ';' + PHONE_BOOT_SCRIPT }} />
        <noscript>
          <style>{`.os-window{opacity:1!important;transform:none!important}.chat-rest{visibility:visible!important}html.booting body::after{display:none}.lockscreen{display:none!important}`}</style>
        </noscript>
        <JsonLd data={organizationJsonLd(settings)} />
      </head>
      <body className="min-h-dvh pb-24 lg:pb-28">
        {/* First in the document so it paints with the first frame on phones (hidden on desktop). */}
        <LockScreen notes={lockNotes} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-window">
          Skip to content
        </a>
        <MotionProvider>
          <MenuBar settings={settings} />
          <StatusBar open={settings.openForProjects} />
          <main id="main">{children}</main>
          <Footer settings={settings} />
          <Dock products={products} settings={settings} />
          <PhoneDock whatsappHref={whatsappLink(settings.whatsapp, '/')} />
          <BuilderModal rateCard={rateCard} />
          <ZoomOverlay />
          <Boot />
          <PhoneShell banner={banner} />
        </MotionProvider>
        {draft.isEnabled && <LivePreview />}
        {plausible && <Script defer data-domain={plausible} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />}
      </body>
    </html>
  )
}
