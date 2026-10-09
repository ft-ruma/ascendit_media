import type { CollectionConfig } from 'payload'
import { revalidate } from '@/lib/revalidate'
import { anyone, editors } from './access'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: { useAsTitle: 'name', group: 'Studio', defaultColumns: ['name', 'role', 'order'] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  defaultSort: 'order',
  hooks: { afterChange: [() => revalidate(['/', '/studio'])] },
  fields: [
    { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'role', type: 'text', required: true }] },
    { name: 'portraitLoop', type: 'upload', relationTo: 'media', admin: { description: 'Short muted loop or a still.' } },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
