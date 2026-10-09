import { AppIcon } from '@/os/AppIcon'
import { Footage } from '@/os/Footage'
import { BeatHeader } from '../BeatHeader'
import { StoreToSystemPin } from './StoreToSystemPin'

const STEPS = [
  { n: '01', file: 'floor-plan.render', title: 'Design the store', body: 'Layout, fixtures and photoreal renders.', accent: 'tangerine' as const },
  { n: '02', file: 'pos.app', title: 'Install the till', body: 'Ascendit POS with your stock loaded.', accent: 'lilac' as const },
  { n: '03', file: 'shop.web', title: 'Open online', body: 'An online store on the same stock.', accent: 'aqua' as const },
  { n: '04', file: 'launch.mov', title: 'Launch it', body: 'Opening-week reels, signage and ads.', accent: 'lime' as const },
]

/** Beat 3: the only GSAP ScrollTrigger on the page. Pins the row while the four windows open in sequence. */
export function Beat3StoreToSystem() {
  return (
    <section aria-labelledby="beat-s2s" className="relative mx-auto mt-24 max-w-[1536px] px-4 lg:px-6">
      <StoreToSystemPin>
        <BeatHeader n={3} id="beat-s2s" eyebrow="Store to System" title={<>From floor plan<br />to first sale.</>}>
          Pick two or more and the bundle saving applies automatically in the project builder.
        </BeatHeader>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} data-s2s-window className="overflow-hidden rounded-window border border-hairline bg-window shadow-window">
              <div className="flex h-10 items-center gap-1.5 border-b border-hairline bg-gradient-to-b from-white to-paper/60 px-3">
                <span aria-hidden className="size-3 rounded-full border border-ink/10 bg-ink/10" />
                <span aria-hidden className="size-3 rounded-full border border-ink/10 bg-ink/10" />
                <span aria-hidden className="size-3 rounded-full border border-ink/10 bg-ink/10" />
                <span className="ml-auto mr-auto font-mono text-[13px] text-graphite">{s.file}</span>
              </div>
              <div className="aspect-[4/3]">
                {s.n === '02' ? <PosMock /> : s.n === '03' ? <ShopMock /> : <Footage label={s.n === '01' ? 'Store render walkthrough' : 'Launch reel'} tone={s.n === '04' ? 'ink' : 'plaster'} />}
              </div>
              <div className="border-t border-hairline p-5">
                <p className="font-mono text-[13px] text-graphite">{s.n}</p>
                <h3 className="mt-1 text-[20px] font-semibold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-1 text-[15px] text-ink/80">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </StoreToSystemPin>
    </section>
  )
}

function PosMock() {
  const lines = [['Kithul treacle 750ml', '1,450'], ['Red rice 5kg', '2,100'], ['Ceylon tea 400g', '1,280']]
  return (
    <div className="grid size-full grid-cols-[1fr_1.1fr] gap-3 bg-paper p-4">
      <div className="grid grid-cols-2 content-start gap-2">
        {['Rice', 'Tea', 'Spices', 'Dairy'].map((c) => (
          <span key={c} className="rounded-lg border border-hairline bg-window px-2 py-3 text-center text-[12px] font-medium text-ink">{c}</span>
        ))}
        <span className="col-span-2 mt-1 flex justify-center"><AppIcon glyph="POS" accent="tangerine" className="size-10 text-[11px]" /></span>
      </div>
      <div className="flex flex-col rounded-lg border border-hairline bg-window p-3 font-mono text-[11px] text-ink">
        {lines.map(([n, p]) => (
          <span key={n} className="flex justify-between gap-2 border-b border-dashed border-hairline py-1"><span className="truncate">{n}</span><span>{p}</span></span>
        ))}
        <span className="mt-auto flex justify-between pt-2 text-[13px] font-semibold"><span>Total</span><span>LKR 4,830</span></span>
      </div>
    </div>
  )
}

function ShopMock() {
  return (
    <div className="grid size-full grid-rows-[auto_1fr] gap-3 bg-paper p-4">
      <div className="flex items-center gap-2 rounded-pill border border-hairline bg-window px-3 py-1.5 font-mono text-[11px] text-graphite">shop.yourstore.lk</div>
      <div className="grid grid-cols-3 gap-2">
        {['bg-tangerine/30', 'bg-lilac/40', 'bg-lime/50', 'bg-plaster', 'bg-aqua/20', 'bg-tangerine/20'].map((c, i) => (
          <span key={i} className={`rounded-lg border border-hairline ${c}`} />
        ))}
      </div>
    </div>
  )
}
