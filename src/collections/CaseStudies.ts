import type { CollectionConfig } from 'payload'
import { notifyN8n, revalidate } from '@/lib/revalidate'
import { pillarSlug } from '@/lib/pillars'
import { editors, publishedOrSignedIn } from './access'
import { PILLAR_OPTIONS, seoGroup, slugField } from './fields'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'client',
    group: 'Content',
    defaultColumns: ['client', 'projectStatus', 'industry', 'featured', '_status'],
    livePreview: { url: ({ data }) => `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/preview?path=/work/${data.slug}&secret=${process.env.PREVIEW_SECRET ?? ''}` },
  },
  versions: { drafts: { autosave: { interval: 800 }, schedulePublish: true }, maxPerDoc: 25 },
  access: { read: publishedOrSignedIn, create: editors, update: editors, delete: editors },
  defaultSort: '-publishedAt',
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        if (doc._status !== 'published') return
        const pillars: string[] = doc.pillars ?? []
        await revalidate(['/', '/projects', '/work', `/work/${doc.slug}`, ...pillars.map((p) => `/services/${pillarSlug(p)}`)])
        if (previousDoc?._status !== 'published') await notifyN8n('case-study.published', doc)
      },
    ],
  },
  fields: [
    { name: 'client', type: 'text', required: true },
    slugField('client'),
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'industry', type: 'text', required: true },
        {
          name: 'location',
          type: 'select',
          required: true,
          defaultValue: 'LK',
          options: [
            { label: 'Sri Lanka', value: 'LK' },
            { label: 'International', value: 'intl' },
          ],
        },
      ],
    },
    { name: 'pillars', type: 'select', hasMany: true, required: true, options: PILLAR_OPTIONS },
    { name: 'result', type: 'text', required: true, admin: { description: 'One line: the outcome, with a number if possible.' } },
    { name: 'brief', type: 'textarea', required: true },
    {
      name: 'approach',
      type: 'array',
      label: 'Approach by pillar',
      fields: [
        { name: 'pillar', type: 'select', required: true, options: PILLAR_OPTIONS },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
    {
      name: 'metrics',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
            { name: 'unit', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'subProjects',
      label: 'Sub-projects',
      type: 'array',
      labels: { singular: 'Sub-project', plural: 'Sub-projects' },
      admin: {
        initCollapsed: false,
        description:
          'The parts of this project, e.g. 3D design, branding, social media marketing. Each one is its own node in "Ongoing & completed projects" and counts as one toward the universe total. A project with no sub-projects counts as one.',
        components: { RowLabel: '/admin-ui/SubProjectLabel#SubProjectLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { placeholder: 'e.g. 3D design', width: '40%' } },
            { name: 'service', type: 'select', required: true, options: PILLAR_OPTIONS, admin: { width: '30%', description: 'Sets the node colour.' } },
            {
              name: 'stage',
              label: 'Status',
              type: 'select',
              required: true,
              defaultValue: 'completed',
              options: [
                { label: 'Completed', value: 'completed' },
                { label: 'Ongoing', value: 'in-progress' },
              ],
              admin: { width: '30%' },
            },
          ],
        },
        { name: 'summary', type: 'textarea', admin: { description: 'Optional: one or two lines on what was done.' } },
        {
          name: 'startedAt',
          label: 'Started',
          type: 'date',
          admin: { date: { pickerAppearance: 'monthOnly' }, description: 'Optional. Newer work grows further out; empty uses the project date.' },
        },
      ],
    },
    { name: 'cover', type: 'upload', relationTo: 'media', admin: { description: 'Cover frame. Needed before publishing; the site shows a placeholder slate until then.' } },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'video', type: 'upload', relationTo: 'media' },
    { name: 'quote', type: 'relationship', relationTo: 'testimonials' },
    {
      name: 'windowFileName',
      type: 'text',
      required: true,
      admin: { position: 'sidebar', description: 'Shown in the window title bar, e.g. grocer-flagship.case' },
    },
    {
      name: 'projectStatus',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'completed',
      options: [
        { label: 'Completed (case study)', value: 'completed' },
        { label: 'In progress (now building)', value: 'in-progress' },
      ],
      admin: { position: 'sidebar', description: 'In-progress projects show under "Now building" with the progress note.' },
    },
    {
      name: 'progress',
      type: 'text',
      admin: { position: 'sidebar', condition: (data) => data?.projectStatus === 'in-progress', description: 'e.g. "Fit-out, week 6 of 9"' },
    },
    {
      name: 'expectedLaunch',
      type: 'date',
      admin: { position: 'sidebar', condition: (data) => data?.projectStatus === 'in-progress', date: { pickerAppearance: 'monthOnly' } },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Shows on the home Work beat.' } },
    { name: 'publishedAt', type: 'date', required: true, defaultValue: () => new Date().toISOString(), admin: { position: 'sidebar' } },
    seoGroup,
  ],
}
