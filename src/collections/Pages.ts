import type { CollectionConfig } from 'payload'
import { revalidate } from '@/lib/revalidate'
import { anyone, editors } from './access'
import { slugField } from './fields'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', group: 'Content', description: 'Legal pages: /legal/<slug>' },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  hooks: { afterChange: [({ doc }) => revalidate([`/legal/${doc.slug}`])] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'content', type: 'richText', required: true },
  ],
}
