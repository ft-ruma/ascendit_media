import Link from 'next/link'
import type { CaseStudy, Product, Settings } from '@/lib/types'
import { whatsappLink } from '@/lib/whatsapp'
import { AppIcon } from '@/os/AppIcon'
import { Doodle } from '@/os/Doodle'
import { LoopVideo } from '@/os/LoopVideo'
import { Showreel } from '@/os/Showreel'
import { StartButton } from '@/os/StartButton'
import { Sticker } from '@/os/Sticker'
import { AppTile, glyph, tiles } from './AppTile'
import { HelloSticker } from './HelloSticker'
import { ServicesFolder } from './ServicesFolder'
import { StoreToSystemWidget } from './StoreToSystemWidget'

type Props = { settings: Settings; products: Product[]; cases: CaseStudy[] }

/** Phone/tablet home screen: widgets + app grid over the same CMS data as the desktop beats. */
export function HomeScreen({ settings, products, cases }: Props) {
  const latest = [...cases].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]
  const story = cases.find((c) => c.featured && c.pillars.includes('retail')) ?? cases.find((c) => c.pillars.includes('retail'))
  const wa = whatsappLink(settings.whatsapp, '/')

  return (
    <div className="home-screen mx-auto grid max-w-[860px] gap-4 px-4 pt-4 md:px-6 lg:hidden">
      {/* Hero widget (large) */}
      <section aria-labelledby="phone-hero" className="widget overflow-hidden">
        <div className="p-5 pb-4">
          <p className="font-mono text-[12px] text-graphite">hello.txt · Nittambuwa, Sri Lanka</p>
          <h1 id="phone-hero" className="mt-2 text-[34px] font-medium leading-[1.02] tracking-[-0.035em] text-ink md:text-[44px]">
            From the shop floor <span className="font-serif text-[1.12em] font-normal italic tracking-[-0.01em]">to the cloud</span>
          </h1>
          <p className="mt-2 text-[15px] leading-snug text-ink/80">Store design, POS and software, websites and launch content. One studio, one system.</p>
        </div>
        <div className="relative aspect-video border-y border-hairline">
          <Showreel />
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-pill bg-window/90 px-2 py-0.5 font-mono text-[11px] text-ink">showreel.mp4</span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-4">
          <StartButton source="phone-hero" className="btn-aqua h-12 text-[15px]">Start a project</StartButton>
          <a href={wa} target="_blank" rel="noopener" className="btn-ghost h-12 text-[15px]">Chat on WhatsApp</a>
        </div>
      </section>

      {/* Small widgets row */}
      <div className="grid grid-cols-2 gap-4">
        <section aria-label="Studio stats" className="widget grid content-between gap-3 p-4">
          <p className="font-mono text-[12px] text-graphite">about.app</p>
          <dl className="grid gap-1.5">
            <div className="flex items-baseline gap-1.5"><dd className="text-[30px] font-medium leading-none tracking-tight tabular-nums text-ink">{settings.stats.clients}+</dd><dt className="text-[13px] text-graphite">clients</dt></div>
            <div className="flex items-baseline gap-1.5"><dd className="text-[20px] font-medium leading-none tabular-nums text-ink">{settings.stats.team}</dd><dt className="text-[13px] text-graphite">people</dt></div>
            <div className="flex items-baseline gap-1.5"><dd className="text-[20px] font-medium leading-none tabular-nums text-ink">{settings.stats.products}</dd><dt className="text-[13px] text-graphite">products</dt></div>
          </dl>
        </section>
        <section aria-label="Say hello" className="widget relative grid place-items-center overflow-hidden bg-plaster p-3">
          <HelloSticker name="Ascendit" />
          <span aria-hidden className="absolute bottom-2 right-3 font-mono text-[13px] text-ink">(＾▽＾)/</span>
        </section>
      </div>

      {/* App grid: 4 columns on phones, 6 on tablets */}
      <nav aria-label="Apps" className="relative px-1 py-2">
        <ul className="grid grid-cols-4 gap-x-2 gap-y-5 md:grid-cols-6">
          <li className="flex justify-center"><AppTile href="/work" label="Work" tile={tiles.work}>{glyph.work}</AppTile></li>
          <li className="flex justify-center"><ServicesFolder /></li>
          {products.map((p) => (
            <li key={p.slug} className="flex justify-center">
              <Link href={`/products/${p.slug}`} data-app className="group flex flex-col items-center gap-1.5 rounded-[18px]">
                <span className="transition group-active:scale-90"><AppIcon glyph={p.glyph} accent={p.accent} className="size-[62px] text-[17px]" /></span>
                <span className="text-[12px] font-medium leading-tight text-ink">{p.glyph === 'Care' ? 'CareSuite' : p.glyph}</span>
              </Link>
            </li>
          ))}
          <li className="flex justify-center"><AppTile href="/notes" label="Notes" tile={tiles.notes}>{glyph.notes}</AppTile></li>
          <li className="flex justify-center"><AppTile href="/photos" label="Photos" tile={tiles.photos}>{glyph.photos}</AppTile></li>
          <li className="flex justify-center"><AppTile href="/messages" label="Messages" tile={tiles.messages}>{glyph.messages}</AppTile></li>
          <li className="flex justify-center"><AppTile href="/studio" label="Studio" tile={tiles.studio}>{glyph.studio}</AppTile></li>
          <li className="flex justify-center"><AppTile href="/careers" label="Careers" tile={tiles.careers}>{glyph.careers}</AppTile></li>
          <li className="flex justify-center"><AppTile href="/contact" label="Contact" tile={tiles.contact}>{glyph.contact}</AppTile></li>
        </ul>
      </nav>

      <div aria-hidden className="relative -my-2 flex items-center justify-between px-2">
        <Sticker accent="lime" rotate={-6}>made in nittambuwa</Sticker>
        <span className="font-mono text-[15px] text-ink">ʕ•ᴥ•ʔ</span>
        <Sticker accent="lilac" rotate={5}>{settings.stats.clients}+ shops</Sticker>
      </div>

      {story && <StoreToSystemWidget story={story} />}

      {/* Latest work widget */}
      {latest && (
        <section aria-labelledby="latest-work" className="widget relative overflow-hidden">
          <Link href={`/work/${latest.slug}`} data-app className="block">
            <div className="relative aspect-[16/10]">
              <LoopVideo video={latest.video ?? latest.cover} label={`${latest.client}: ${latest.industry}`} />
              <span className="absolute left-3 top-3 rounded-pill bg-window/90 px-2 py-0.5 font-mono text-[11px] text-ink">{latest.windowFileName}</span>
              <Doodle shape="circle" className="absolute -bottom-2 right-2 w-32 text-tangerine" />
            </div>
            <div className="grid gap-1 p-4">
              <p className="font-mono text-[12px] text-graphite">Latest work</p>
              <h2 id="latest-work" className="text-[22px] font-medium tracking-tight text-ink">{latest.client}</h2>
              <p className="text-[15px] text-ink/80">{latest.result}</p>
            </div>
          </Link>
        </section>
      )}

      <p aria-hidden className="py-2 text-center font-mono text-[13px] text-graphite">that&apos;s the whole home screen (◕‿◕)</p>
    </div>
  )
}
