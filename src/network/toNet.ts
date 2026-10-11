import type { CaseStudy } from '@/lib/types'
import type { NetProject } from './types'

/** Case studies (completed and ongoing) as network projects, oldest first so the network grows outward. */
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
      parts: c.subProjects?.length
        ? c.subProjects.map((s) => ({
            title: s.title,
            service: s.service,
            status: s.status,
            summary: s.summary ?? null,
            date: (s.startedAt ?? c.publishedAt).slice(0, 10),
          }))
        : [{ title: c.client, service: c.pillars[0] ?? 'web', status: c.status, date: c.publishedAt.slice(0, 10), whole: true }],
    }))
}
