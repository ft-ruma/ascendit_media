import type { PillarKey } from '@/lib/types'

/** One node: a sub-project, or the whole project when it has none. */
export type NetPart = {
  title: string
  service: PillarKey
  status: 'completed' | 'in-progress'
  summary?: string | null
  /** growth order: newer work sits further out */
  date: string
  /** true when the project has no sub-projects and this node is the project itself */
  whole?: boolean
}

/** A main project and its parts (always at least one). */
export type NetProject = {
  slug: string
  client: string
  industry: string
  location: 'LK' | 'intl'
  pillars: PillarKey[]
  result: string
  status: 'completed' | 'in-progress'
  progress?: string | null
  metrics: { label: string; value: string; unit?: string | null }[]
  publishedAt: string
  parts: NetPart[]
}

/** The network total: every sub-project counts as one (a project without sub-projects counts as one). */
export const countNodes = (projects: NetProject[]) => projects.reduce((n, p) => n + Math.max(1, p.parts.length), 0)
