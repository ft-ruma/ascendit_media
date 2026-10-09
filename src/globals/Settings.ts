import type { GlobalConfig } from 'payload'
import { revalidate } from '@/lib/revalidate'
import { anyone, editors } from '@/collections/access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: { group: 'Studio' },
  access: { read: anyone, update: editors },
  hooks: { afterChange: [() => revalidate(['/', '/studio', '/contact', '/products', '/work'])] },
  fields: [
    {
      name: 'stats',
      type: 'group',
      label: 'Live stats (menu bar and Proof beat)',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'clients', type: 'number', required: true },
            { name: 'team', type: 'number', required: true },
            { name: 'products', type: 'number', required: true },
            { name: 'years', type: 'number', required: true },
          ],
        },
      ],
    },
    { name: 'openForProjects', type: 'checkbox', defaultValue: true, label: 'Show "Open for projects" in the menu bar' },
    {
      type: 'row',
      fields: [
        { name: 'whatsapp', type: 'text', required: true, admin: { description: 'International format, e.g. +94743662318' } },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
      ],
    },
    { name: 'bookingUrl', type: 'text', required: true, admin: { description: 'Cal.com or Calendly link' } },
    {
      name: 'office',
      type: 'group',
      fields: [
        { type: 'row', fields: [{ name: 'line1', type: 'text', required: true }, { name: 'city', type: 'text', required: true }, { name: 'country', type: 'text', required: true }] },
        { name: 'mapUrl', type: 'text' },
      ],
    },
    { name: 'socials', type: 'array', fields: [{ type: 'row', fields: [{ name: 'label', type: 'text', required: true }, { name: 'url', type: 'text', required: true }] }] },
    {
      name: 'founderNote',
      type: 'group',
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'role', type: 'text', required: true }] },
        { name: 'video', type: 'upload', relationTo: 'media', admin: { description: 'Founder video with WebVTT captions' } },
      ],
    },
  ],
}
