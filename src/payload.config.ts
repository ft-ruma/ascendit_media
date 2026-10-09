import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { azureStorage } from '@payloadcms/storage-azure'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { CaseStudies } from './collections/CaseStudies'
import { Careers } from './collections/Careers'
import { LeadOutbox } from './collections/LeadOutbox'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Pillars } from './collections/Pillars'
import { Products } from './collections/Products'
import { RateCard } from './collections/RateCard'
import { Team } from './collections/Team'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { Pricing } from './globals/Pricing'
import { Settings } from './globals/Settings'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const azure = process.env.AZURE_STORAGE_CONNECTION_STRING

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'dev-only-secret',
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · Ascendit OS' },
    livePreview: {
      breakpoints: [
        { label: 'Phone', name: 'phone', width: 390, height: 844 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Pillars, CaseStudies, Products, RateCard, Testimonials, Team, Careers, Pages, Media, Users, LeadOutbox],
  globals: [Settings, Pricing],
  editor: lexicalEditor(),
  db: postgresAdapter({
    // Own schema in the CRM's Supabase Postgres; the payload role has no grants on CRM tables.
    schemaName: 'cms',
    pool: { connectionString: process.env.DATABASE_URI },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Dev pushes schema changes; staging and production only run committed migrations.
    push: process.env.NODE_ENV !== 'production',
  }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  plugins: [
    azureStorage({
      enabled: !!azure,
      collections: { media: true },
      allowContainerCreate: process.env.AZURE_STORAGE_ALLOW_CONTAINER_CREATE === 'true',
      baseURL: process.env.AZURE_STORAGE_ACCOUNT_BASEURL ?? '',
      connectionString: azure ?? '',
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME ?? 'media',
    }),
  ],
  // Scheduled publish runs through the jobs queue; Vercel Cron calls /api/payload-jobs/run.
  jobs: {
    access: {
      run: ({ req }) =>
        !!req.user || req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`,
    },
    tasks: [],
  },
})
