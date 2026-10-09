import type { CollectionConfig } from 'payload'
import { anyone, editors } from './access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content', description: 'Stored in Azure Blob behind the CDN. Loops: 1280px, muted, 6 to 8 s, under 1.5 MB (see scripts/encode.sh).' },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'audio/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 480 },
      { name: 'card', width: 960 },
      { name: 'wide', width: 1920 },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Describe what is shown. Required for every file.' } },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Required for video: the frame shown before the loop plays and under reduced motion.' },
      validate: (value: unknown, { data }: { data: Partial<{ mimeType: string }> }) =>
        data?.mimeType?.startsWith('video/') && !value ? 'Videos need a poster frame' : true,
    },
    {
      name: 'sources',
      type: 'group',
      admin: { description: 'Optional extra encodes. The main upload should be the H.264 MP4.' },
      fields: [
        { name: 'av1', type: 'upload', relationTo: 'media' },
        { name: 'webm', type: 'upload', relationTo: 'media' },
        { name: 'vertical', type: 'upload', relationTo: 'media', admin: { description: '720x1280 crop for phones' } },
      ],
    },
  ],
}
