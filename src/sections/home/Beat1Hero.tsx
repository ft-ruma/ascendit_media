import { DesktopIcon } from '@/os/DesktopIcon'
import { Doodle } from '@/os/Doodle'
import { ChatBubble } from '@/os/ChatBubble'
import { Showreel } from '@/os/Showreel'
import { StartButton } from '@/os/StartButton'
import { Sticker } from '@/os/Sticker'
import { Window } from '@/os/Window'
import { Lines } from '@/lib/lines'
import type { HomeContent, Settings } from '@/lib/types'

export function Beat1Hero({ settings, hero }: { settings: Settings; hero: HomeContent['hero'] }) {
  return (
    <section aria-labelledby="hero-title" className="relative mx-auto max-w-[1536px] px-4 pt-6 lg:h-[940px] lg:px-6 lg:pt-0">
      <div className="grid gap-4 lg:block">
        <Window title="hello.txt" pos={{ x: '3%', y: '56px', w: '52%' }} bodyClassName="p-6 sm:p-10" reveal={false}>
          <p className="eyebrow mb-5">{hero.eyebrow}</p>
          {/* LCP: server-rendered text in Geist/Instrument with size-adjusted fallbacks. */}
          <h1 id="hero-title" className="display text-[52px] text-ink sm:text-[76px] xl:text-[92px]">
            <Lines text={hero.headline} />
          </h1>
          <p className="mt-6 max-w-[46ch] text-[18px] leading-relaxed text-ink/85">
            {hero.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StartButton source="hero" className="btn-aqua h-12 px-7 text-[16px]">
              {hero.primaryCta}
            </StartButton>
            <a href="/work" className="btn-ghost h-12 px-6 text-[16px]">
              {hero.secondaryCta}
            </a>
          </div>
        </Window>

        <Window title="showreel.mov" pos={{ x: '52%', y: '128px', w: '45%', r: 1.2 }} bodyClassName="aspect-video" reveal={false}>
          <Showreel />
        </Window>

        <Window title="messages" pos={{ x: '62%', y: '470px', w: '31%', r: -1 }} bodyClassName="grid gap-3 p-5" delay={0.3}>
          <ChatBubble text={hero.askBubble} meta="Client · 9:41" />
          <ChatBubble from="us" text={hero.replyBubble} meta="Ascendit · 9:42" />
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
          {hero.seal}
        </Sticker>
        <Doodle shape="arrow" className="absolute left-[55%] top-[640px] w-24 rotate-[160deg] text-ink/50" delay={1.6} />
      </div>
    </section>
  )
}
