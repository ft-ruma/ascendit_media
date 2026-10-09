import type { CollectionConfig } from 'payload'
import { PRICE_PATHS, revalidate } from '@/lib/revalidate'
import { anyone, pricingEditors } from './access'
import { PILLAR_OPTIONS } from './fields'

export const RateCard: CollectionConfig = {
  slug: 'rate-card',
  labels: { singular: 'Rate card entry', plural: 'Rate card' },
  admin: {
    useAsTitle: 'pillar',
    group: 'Pricing',
    description: 'Drives the project builder estimate. Changes revalidate every page that shows a price.',
  },
  access: { read: anyone, create: pricingEditors, update: pricingEditors, delete: pricingEditors },
  hooks: { afterChange: [() => revalidate(PRICE_PATHS)] },
  fields: [
    { name: 'pillar', type: 'select', required: true, unique: true, options: PILLAR_OPTIONS },
    {
      name: 'unit',
      type: 'select',
      required: true,
      defaultValue: 'project',
      options: [
        { label: 'Per project', value: 'project' },
        { label: 'Per square foot of floor area', value: 'sqft' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'basePriceLKR', type: 'number', required: true },
        { name: 'basePriceUSD', type: 'number', required: true },
      ],
    },
    {
      name: 'multipliers',
      type: 'array',
      admin: { description: 'When the answer to a scope question matches, the base is multiplied by the factor.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'question', type: 'text', required: true, admin: { description: 'e.g. pages, modules, service' } },
            { name: 'answer', type: 'text', required: true, admin: { description: 'e.g. 6-15, web-mobile' } },
            { name: 'factor', type: 'number', required: true, min: 0 },
          ],
        },
      ],
    },
  ],
}
