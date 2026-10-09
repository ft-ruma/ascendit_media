import { DesktopIcon } from '@/os/DesktopIcon'
import { Doodle } from '@/os/Doodle'
import { ChatBubble } from '@/os/ChatBubble'
import { Showreel } from '@/os/Showreel'
import { StartButton } from '@/os/StartButton'
import { Sticker } from '@/os/Sticker'
import { Window } from '@/os/Window'
import type { Settings } from '@/lib/types'

export function Beat1Hero({ settings }: { settings: Settings }) {
  return (
    <section aria-labelledby="hero-title" className="relative mx-auto max-w-[1536px] px-4 pt-6 lg:h-[940px] lg:px-6 lg:pt-0">
      <div className="grid gap-4 lg:block">
        <Window title="hello.txt" pos={{ x: '3%', y: '56px', w: '52%' }} bodyClassName="p-6 sm:p-10" reveal={false}>
          <p className="eyebrow mb-5">Ascendit Media · Nittambuwa, Sri Lanka</p>
          {/* LCP: server-rendered text in Geist/Instrument with size-adjusted fallbacks. */}
          <h1 id="hero-title" className="display text-[52px] text-ink sm:text-[76px] xl:text-[92px]">
            We design the store,
            <br />
            build the system,
            <br />
            and launch the brand.
          </h1>
          <p className="mt-6 max-w-[46ch] text-[18px] leading-relaxed text-ink/85">
            Retail interiors, POS and custom software, websites and launch content. One studio, one team, from the floor plan to the first sale.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StartButton source="hero" className="btn-aqua h-12 px-7 text-[16px]">
              Start a project
            </StartButton>
            <a href="/work" className="btn-ghost h-12 px-6 text-[16px]">
              See the work
            </a>
          </div>
        </Window>

        <Window title="showreel.mov" pos={{ x: '52%', y: '128px', w: '45%', r: 1.2 }} bodyClassName="aspect-video" reveal={false}>
          <Showreel />
        </Window>

        <Window title="messages" pos={{ x: '62%', y: '470px', w: '31%', r: -1 }} bodyClassName="grid gap-3 p-5" delay={0.3}>
          <ChatBubble text="Can you design my shop and set up the POS too?" meta="Client · 9:41" />
          <ChatBubble from="us" text="Yes. And the website, and the launch reels." meta="Ascendit · 9:42" />
        </Window>
      </div>

      {/* Desktop furniture (decorative at phone sizes is dropped for clarity). */}
      <div className="pointer-events-none hidden lg:block">
        <div className="pointer-events-auto absolute left-[4%] top-[810px] flex gap-2">
          <DesktopIcon href="/work" label="Work" accent="aqua" />
          <DesktopIcon href="/products" label="Products" accent="lilac" />
          <DesktopIcon href="/studio" label="Studio" accent="lime" />
        </div>
        <Sticker accent="lime" rotate={-8} className="absolute left-[34%] top-[830px]">
          {settings.stats.clients}+ clients
        </Sticker>
        <Sticker accent="tangerine" variant="seal" rotate={10} className="absolute left-[50%] top-[86px] z-20">
          Made in Sri Lanka
        </Sticker>
        <Doodle shape="arrow" className="absolute left-[55%] top-[640px] w-24 rotate-[160deg] text-ink/50" delay={1.6} />
      </div>
    </section>
  )
}
