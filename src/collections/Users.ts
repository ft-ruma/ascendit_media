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
  hooks: {
    // The very first account (created on the /admin welcome screen) is always an admin.
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
        return totalDocs === 0 ? { ...data, roles: ['admin'] } : data
      },
    ],
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
