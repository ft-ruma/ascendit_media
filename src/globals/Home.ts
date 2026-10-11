import type { Field, GlobalConfig } from 'payload'
import { revalidate } from '@/lib/revalidate'
import { anyone, editors } from '@/collections/access'
import { home as d } from '@/seed/data'

// Every piece of home-page copy. Defaults are the launch copy, so an empty
// database still renders the same page. Line breaks in titles are kept.

const beat = (name: keyof typeof d.beats, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    { name: 'eyebrow', type: 'text', required: true, defaultValue: d.beats[name].eyebrow },
    { name: 'title', type: 'textarea', required: true, defaultValue: d.beats[name].title, admin: { description: 'Press Enter where the line should break on desktop.' } },
    { name: 'intro', type: 'textarea', defaultValue: d.beats[name].intro ?? undefined },
  ],
})

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home page',
  admin: { group: 'Content', description: 'Headlines and section text on the home page (desktop and phone).' },
  access: { read: anyone, update: editors },
  hooks: { afterChange: [() => revalidate(['/', '/network'])] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Desktop hero',
          name: 'hero',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, defaultValue: d.hero.eyebrow },
            { name: 'headline', type: 'textarea', required: true, defaultValue: d.hero.headline, admin: { description: 'One line per row.' } },
            { name: 'intro', type: 'textarea', required: true, defaultValue: d.hero.intro },
            { type: 'row', fields: [
              { name: 'primaryCta', type: 'text', required: true, defaultValue: d.hero.primaryCta, label: 'Main button' },
              { name: 'secondaryCta', type: 'text', required: true, defaultValue: d.hero.secondaryCta, label: 'Second button' },
            ] },
            { name: 'seal', type: 'text', required: true, defaultValue: d.hero.seal, label: 'Round sticker text' },
            { type: 'row', fields: [
              { name: 'askBubble', type: 'text', required: true, defaultValue: d.hero.askBubble, label: 'Chat: client asks' },
              { name: 'replyBubble', type: 'text', required: true, defaultValue: d.hero.replyBubble, label: 'Chat: we reply' },
            ] },
          ],
        },
        {
          label: 'Phone hero',
          name: 'phoneHero',
          fields: [
            { type: 'row', fields: [
              { name: 'headline', type: 'text', required: true, defaultValue: d.phoneHero.headline },
              { name: 'accent', type: 'text', required: true, defaultValue: d.phoneHero.accent, admin: { description: 'Shown in italic serif after the headline.' } },
            ] },
            { name: 'intro', type: 'textarea', required: true, defaultValue: d.phoneHero.intro },
          ],
        },
        {
          label: 'Sections',
          name: 'beats',
          fields: [
            beat('services', '2 · Services'),
            beat('storeToSystem', '3 · Store to System'),
            beat('products', '4 · Products'),
            beat('work', '5 · Work'),
            beat('proof', '6 · Proof'),
            beat('studio', '7 · Studio'),
            beat('start', '8 · Start'),
          ],
        },
        {
          label: 'Store to System steps',
          fields: [
            {
              name: 'storeToSystem',
              type: 'array',
              minRows: 4,
              maxRows: 4,
              defaultValue: d.storeToSystem,
              admin: { description: 'The four windows: design, POS, online store, launch.' },
              fields: [
                { name: 'file', type: 'text', required: true, admin: { description: 'File name in the title bar, e.g. pos.app' } },
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Network',
          name: 'network',
          description: 'The project network: every case study is a node. It becomes a universe at the threshold below.',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, defaultValue: d.network.eyebrow },
            { name: 'title', type: 'textarea', required: true, defaultValue: d.network.title },
            { name: 'intro', type: 'textarea', defaultValue: d.network.intro ?? undefined },
            {
              name: 'universeAt',
              type: 'number',
              required: true,
              min: 10,
              defaultValue: d.network.universeAt,
              label: 'Becomes a universe at (projects)',
              admin: { description: 'Preview the universe any time with ?network=universe on the home or /network page.' },
            },
          ],
        },
        {
          label: 'Now building',
          name: 'nowBuilding',
          description: 'Shown when at least one case study has the status "In progress".',
          fields: [
            { name: 'title', type: 'text', required: true, defaultValue: d.nowBuilding.title },
            { name: 'intro', type: 'text', required: true, defaultValue: d.nowBuilding.intro },
          ],
        },
      ],
    },
  ],
}
