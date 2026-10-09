import type { Field } from 'payload'

export const PILLAR_OPTIONS = [
  { label: 'Retail design', value: 'retail' },
  { label: 'Software', value: 'software' },
  { label: 'Web', value: 'web' },
  { label: 'Brand & content', value: 'brand' },
]

export const ACCENT_OPTIONS = [
  { label: 'Lilac (software)', value: 'lilac' },
  { label: 'Tangerine (retail)', value: 'tangerine' },
  { label: 'Aqua (web)', value: 'aqua' },
  { label: 'Lime (brand)', value: 'lime' },
]

export const slugField = (from = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: `URL segment. Lowercase, hyphens only (generated from ${from} if empty).` },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const src = (value as string) || (data?.[from] as string) || ''
        return src.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      },
    ],
  },
})

export const seoGroup: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Under 60 characters. Falls back to the page title.' } },
    { name: 'description', type: 'textarea', admin: { description: 'Under 160 characters.' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
