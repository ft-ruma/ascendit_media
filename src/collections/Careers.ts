import type { CollectionConfig } from 'payload'
import { revalidate } from '@/lib/revalidate'
import { anyone, editors } from './access'
import { slugField } from './fields'

export const Careers: CollectionConfig = {
  slug: 'careers',
  admin: { useAsTitle: 'title', group: 'Studio', defaultColumns: ['title', 'type', 'open'] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  hooks: { afterChange: [({ doc }) => revalidate(['/careers', `/careers/${doc.slug}`])] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { type: 'row', fields: [{ name: 'type', type: 'text', required: true, defaultValue: 'Full-time' }, { name: 'location', type: 'text', required: true }] },
    { name: 'summary', type: 'text', required: true },
    { name: 'description', type: 'array', label: 'Description paragraphs', fields: [{ name: 'paragraph', type: 'textarea', required: true }] },
    { name: 'open', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
