import type { CollectionConfig } from 'payload'
import { admins, hasRole, loggedIn } from './access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', group: 'Admin' },
  access: {
    read: loggedIn,
    create: admins,
    update: ({ req, id }) => hasRole(req.user as never, 'admin') || req.user?.id === id,
    delete: admins,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      options: [
        { label: 'Admin (developers)', value: 'admin' },
        { label: 'Editor (writes and publishes content)', value: 'editor' },
        { label: 'Pricing (rate card and product plans only)', value: 'pricing' },
      ],
      access: { update: ({ req }) => hasRole(req.user as never, 'admin') },
    },
  ],
}
