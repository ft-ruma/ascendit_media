import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const azureBase = process.env.AZURE_STORAGE_ACCOUNT_BASEURL

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: azureBase ? [new URL(`${azureBase.replace(/\/$/, '')}/**`)] : [],
  },
  // Old real paths from the current site go here as 301s once they are listed.
  // Hash anchors (/#services, /#pricing) never reach the server: see HashRedirect.
  async redirects() {
    return []
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
