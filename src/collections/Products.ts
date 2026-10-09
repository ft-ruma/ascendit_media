import type { CollectionConfig } from 'payload'
import { revalidate } from '@/lib/revalidate'
import { editors, hasRole, pricingField, publishedOrSignedIn } from './access'
import { ACCENT_OPTIONS, seoGroup, slugField } from './fields'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Products',
    livePreview: { url: ({ data }) => `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/preview?path=/products/${data.slug}&secret=${process.env.PREVIEW_SECRET ?? ''}` },
  },
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 25 },
  access: {
    read: publishedOrSignedIn,
    create: editors,
    // The pricing role may open products to edit plans; field access limits the rest.
    update: ({ req }) => hasRole(req.user as never, 'editor', 'pricing'),
    delete: editors,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc._status === 'published') return revalidate(['/', '/products', `/products/${doc.slug}`, '/start'])
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      type: 'row',
      fields: [
        { name: 'glyph', type: 'text', required: true, admin: { description: 'Short label drawn on the dock icon, e.g. POS' } },
        { name: 'accent', type: 'select', required: true, options: ACCENT_OPTIONS },
      ],
    },
    { name: 'appIcon', type: 'upload', relationTo: 'media' },
    { name: 'pitch', type: 'textarea', required: true },
    { name: 'audience', type: 'text', required: true },
    {
      name: 'features',
      type: 'array',
      minRows: 1,
      maxRows: 5,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
    {
      name: 'plans',
      type: 'array',
      access: { update: pricingField },
      admin: { description: 'Monthly prices. The first plan is what the project builder adds.' },
      fields: [
        { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'highlight', type: 'checkbox' }] },
        {
          type: 'row',
          fields: [
            { name: 'LKR', type: 'number', required: true, label: 'Monthly LKR' },
            { name: 'USD', type: 'number', required: true, label: 'Monthly USD' },
            { name: 'yearlyDiscountPct', type: 'number', defaultValue: 15, label: 'Yearly discount %' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'setupLKR', type: 'number', required: true, label: 'Setup fee LKR' },
            { name: 'setupUSD', type: 'number', required: true, label: 'Setup fee USD' },
          ],
        },
      ],
    },
    { type: 'row', fields: [{ name: 'demoUrl', type: 'text' }, { name: 'trialUrl', type: 'text', admin: { description: 'Phase 2' } }] },
    { name: 'screenRecording', type: 'upload', relationTo: 'media' },
    {
      name: 'faq',
      type: 'array',
      fields: [
        { name: 'q', type: 'text', required: true, label: 'Question' },
        { name: 'a', type: 'textarea', required: true, label: 'Answer' },
      ],
    },
    seoGroup,
  ],
}
