import type { Accent, PillarKey } from './types'

export const pillarAccent = {
  software: 'lilac',
  retail: 'tangerine',
  web: 'aqua',
  brand: 'lime',
} as const satisfies Record<PillarKey, Accent>

export const PILLAR_SLUGS: Record<PillarKey, string> = {
  retail: 'retail-design',
  software: 'software',
  web: 'web',
  brand: 'brand',
}

export const PILLAR_NAMES: Record<PillarKey, string> = {
  retail: 'Retail design',
  software: 'Software',
  web: 'Web',
  brand: 'Brand & content',
}

export const pillarSlug = (key: string) => PILLAR_SLUGS[key as PillarKey] ?? key

/** Accent fills as Tailwind classes, so the compiler sees every literal. */
export const accentBg: Record<Accent, string> = {
  lilac: 'bg-lilac',
  tangerine: 'bg-tangerine',
  aqua: 'bg-aqua',
  lime: 'bg-lime',
}

/** Text that sits on an accent fill: always Ink (white only on Aqua buttons). */
export const accentSoft: Record<Accent, string> = {
  lilac: 'bg-lilac/25',
  tangerine: 'bg-tangerine/20',
  aqua: 'bg-aqua/15',
  lime: 'bg-lime/40',
}
