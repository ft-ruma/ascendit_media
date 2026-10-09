import type { CollectionConfig } from 'payload'
import { admins } from './access'

/** Leads that could not reach n8n. Table: cms.lead_outbox. Replay with the "Retry" bulk action or scripts. */
export const LeadOutbox: CollectionConfig = {
  slug: 'lead_outbox',
  labels: { singular: 'Outbox lead', plural: 'Lead outbox' },
  admin: { group: 'Admin', useAsTitle: 'reference', defaultColumns: ['reference', 'type', 'attempts', 'lastError', 'createdAt'] },
  access: { read: admins, create: () => false, update: admins, delete: admins },
  fields: [
    { name: 'reference', type: 'text', required: true, index: true },
    { name: 'type', type: 'text', required: true },
    { name: 'payload', type: 'json', required: true },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'lastError', type: 'text' },
    { name: 'delivered', type: 'checkbox', defaultValue: false },
  ],
}
