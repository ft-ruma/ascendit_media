import type { CollectionConfig } from 'payload'
import { revalidate } from '@/lib/revalidate'
import { anyone, editors } from './access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: { useAsTitle: 'person', group: 'Content', defaultColumns: ['person', 'company'] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  hooks: { afterChange: [() => revalidate(['/', '/studio'])] },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { type: 'row', fields: [{ name: 'person', type: 'text', required: true }, { name: 'role', type: 'text' }] },
    { name: 'company', type: 'text', required: true },
    { name: 'caseStudy', type: 'relationship', relationTo: 'case-studies' },
  ],
}
