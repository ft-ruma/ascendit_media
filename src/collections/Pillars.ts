import type { CollectionConfig } from 'payload'
import { revalidate } from '@/lib/revalidate'
import { anyone, editors, pricingField } from './access'
import { ACCENT_OPTIONS, PILLAR_OPTIONS, seoGroup, slugField } from './fields'

export const Pillars: CollectionConfig = {
  slug: 'pillars',
  admin: { useAsTitle: 'name', group: 'Services', defaultColumns: ['name', 'slug', 'fromPriceLKR', 'fromPriceUSD'] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  hooks: {
    afterChange: [({ doc }) => revalidate(['/', `/services/${doc.slug}`, '/start'])],
  },
  fields: [
    { name: 'key', type: 'select', required: true, unique: true, options: PILLAR_OPTIONS, admin: { position: 'sidebar' } },
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'accent', type: 'select', required: true, options: ACCENT_OPTIONS, admin: { position: 'sidebar' } },
    { name: 'oneLiner', type: 'text', required: true },
    { name: 'h1', type: 'text', required: true, admin: { description: 'Use the target search phrase, e.g. "retail store design in Sri Lanka".' } },
    { name: 'intro', type: 'textarea', required: true },
    { name: 'capabilities', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
    {
      name: 'process',
      type: 'array',
      label: 'Process steps',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
    { name: 'tools', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
    {
      type: 'row',
      fields: [
        { name: 'fromPriceLKR', type: 'number', required: true, access: { update: pricingField } },
        { name: 'fromPriceUSD', type: 'number', required: true, access: { update: pricingField } },
      ],
    },
    seoGroup,
  ],
}
