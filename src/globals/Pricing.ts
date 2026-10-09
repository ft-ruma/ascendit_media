import type { GlobalConfig } from 'payload'
import { PRICE_PATHS, revalidate } from '@/lib/revalidate'
import { anyone, pricingEditors } from '@/collections/access'

export const Pricing: GlobalConfig = {
  slug: 'pricing',
  label: 'Estimate settings',
  admin: { group: 'Pricing', description: 'Tune the builder estimate without a deploy.' },
  access: { read: anyone, update: pricingEditors },
  hooks: { afterChange: [() => revalidate(PRICE_PATHS)] },
  fields: [
    { name: 'bundleSavingPct', type: 'number', required: true, defaultValue: 0.1, min: 0, max: 0.5, admin: { description: 'Saving when 2+ retail pieces are picked (0.1 = 10%).' } },
    { name: 'rangeWidth', type: 'number', required: true, defaultValue: 1.6, min: 1, admin: { description: 'High end = low end x this.' } },
    {
      type: 'row',
      fields: [
        { name: 'roundLKR', type: 'number', required: true, defaultValue: 5000, label: 'Round LKR to' },
        { name: 'roundUSD', type: 'number', required: true, defaultValue: 50, label: 'Round USD to' },
      ],
    },
  ],
}
