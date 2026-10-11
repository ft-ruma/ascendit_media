import type { CaseStudy } from '@/lib/types'
import type { NetProject } from './ProjectNetwork'

/** Case studies (completed and in progress) as network nodes, oldest first so the network grows outward. */
export function toNet(cases: CaseStudy[]): NetProject[] {
  return [...cases]
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.slug.localeCompare(b.slug))
    .map((c) => ({
      slug: c.slug,
      client: c.client,
      industry: c.industry,
      location: c.location,
      pillars: c.pillars,
      result: c.result,
      status: c.status,
      progress: c.progress ?? null,
      metrics: c.metrics.slice(0, 2),
      publishedAt: c.publishedAt,
    }))
}
