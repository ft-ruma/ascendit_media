// Pure 3D geometry for the project network. Deterministic (seeded), so the same
// projects always land in the same places and adding a project never moves the
// existing ones: project i always takes slot i.
//
// Brain coordinates: centred on the origin, x runs front (-) to back (+), y runs
// up (-) to down (+) like the screen, z is left (-) to right (+). Units are about
// 1.35 long, 1.05 wide and 0.95 tall, the proportions of a real brain.

export type P3 = { x: number; y: number; z: number }
/** b: brightness 0..1 (crests of the folds are brighter); surface: on the cortex; n: outward normal. */
export type Neuron = P3 & { b: number; surface: boolean; n?: P3 }
export type Layout = { points: Neuron[]; edges: [number, number][]; projectSlots: number[]; gap: number }

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Ell = { c: P3; r: P3 }
const lobe = (x: number, y: number, z: number, rx: number, ry: number, rz: number): Ell[] =>
  (z === 0 ? [0] : [-z, z]).map((cz) => ({ c: { x, y, z: cz }, r: { x: rx, y: ry, z: rz } }))

/** Each lobe as an ellipsoid per hemisphere. */
const LOBES: Ell[] = [
  ...lobe(0, -0.1, 0.25, 0.6, 0.3, 0.27), // cerebrum
  ...lobe(-0.4, -0.05, 0.21, 0.3, 0.26, 0.23), // frontal
  ...lobe(0.4, -0.04, 0.18, 0.25, 0.25, 0.21), // occipital
  ...lobe(-0.04, 0.14, 0.27, 0.36, 0.15, 0.17), // temporal
  ...lobe(0.34, 0.24, 0.11, 0.2, 0.11, 0.15), // cerebellum
  ...lobe(0.17, 0.36, 0, 0.055, 0.13, 0.06), // brainstem
]

const inEll = (p: P3, e: Ell) => ((p.x - e.c.x) / e.r.x) ** 2 + ((p.y - e.c.y) / e.r.y) ** 2 + ((p.z - e.c.z) / e.r.z) ** 2 <= 1
const inLobes = (p: P3) => LOBES.some((e) => inEll(p, e))

/** The lateral fissure's height along the side of each hemisphere. */
const fissureY = (x: number) => 0.07 - 0.09 * Math.sin(((x + 0.35) / 0.6) * Math.PI * 0.5)
/** Longitudinal fissure (between the hemispheres) and lateral fissure (above the temporal lobe). */
const inFissure = (p: P3) =>
  (Math.abs(p.z) < 0.022 && p.y < 0.16) || (p.x > -0.35 && p.x < 0.25 && Math.abs(p.y - fissureY(p.x)) < 0.02 && Math.abs(p.z) > 0.16)

export const inBrain = (p: P3) => inLobes(p) && !inFissure(p)

/** Where growth starts (oldest project): the middle of the left hemisphere. */
const CORE: P3 = { x: -0.05, y: -0.1, z: -0.22 }

/** Gyri: a smooth wavy pattern on the cortex; 1 on a fold's crest, 0 in a groove. */
function gyri(p: P3) {
  const a = Math.sin(21 * p.x + 5 * Math.sin(9 * p.y + 3 * p.z) + 4 * Math.sin(12 * p.z))
  const b = Math.cos(18 * p.y + 4 * Math.sin(11 * p.x) + 2 * Math.sin(8 * p.z))
  return 0.5 + 0.5 * Math.sin(2.2 * (a + 0.7 * b))
}

const ellArea = ({ r }: Ell) => {
  const k = 1.6075
  return 4 * Math.PI * (((r.x * r.y) ** k + (r.x * r.z) ** k + (r.y * r.z) ** k) / 3) ** (1 / k)
}

/** The outer surface of the brain (the cortex), with folds, about n points. */
function cortex(n: number, r: () => number): Neuron[] {
  const areas = LOBES.map(ellArea)
  const total = areas.reduce((a, b) => a + b, 0)
  const out: Neuron[] = []
  LOBES.forEach((e, li) => {
    const m = Math.round(((n * areas[li]) / total) * 2.3) // oversampled: overlapping parts are hidden
    for (let k = 0; k < m; k++) {
      // Fibonacci sphere with a little jitter, so it looks organic rather than gridded
      const y = 1 - ((k + 0.5) / m) * 2 + (r() - 0.5) * (1 / m)
      const rad = Math.sqrt(Math.max(0, 1 - y * y))
      const th = k * 2.399963 + (r() - 0.5) * 0.25
      const d = { x: Math.cos(th) * rad, y, z: Math.sin(th) * rad }
      const at = (f: number): P3 => ({ x: e.c.x + d.x * e.r.x * f, y: e.c.y + d.y * e.r.y * f, z: e.c.z + d.z * e.r.z * f })
      if (inLobes(at(1.04))) continue // covered by another lobe: not on the outside
      const g = gyri(at(1))
      if (g < 0.16) continue // the deepest grooves stay dark, so the folds read as lines
      const p = at(0.985 - 0.07 * (1 - g)) // grooves sit deeper than crests
      if (inFissure(p)) continue
      const nx = d.x / e.r.x
      const ny = d.y / e.r.y
      const nz = d.z / e.r.z
      const nl = Math.hypot(nx, ny, nz)
      out.push({ ...p, b: 0.25 + 0.75 * g, surface: true, n: { x: nx / nl, y: ny / nl, z: nz / nl } })
    }
  })
  if (out.length <= n) return out
  const step = out.length / n // thin evenly to n
  return Array.from({ length: n }, (_, i) => out[Math.floor(i * step)])
}

/** Fine particles over the whole cortex: they draw the folds and the silhouette. */
export const cortexDust = (n: number, seed = 11) => cortex(n, rng(seed))

/** Points the brain needs so every project up to the universe threshold gets a spaced node. */
export const brainPointsFor = (universeAt: number) => Math.min(1800, Math.max(900, Math.ceil(universeAt * 7)))

/**
 * The brain for a given universe threshold: cortex + inner neurons, linked as a mesh,
 * and a slot for each node, growing outward from the core. `nodes` is the node count, or
 * each node's group (its main project), so parts of one project sit next to each other.
 */
export function brainLayout(universeAt: number, nodes: number | number[], seed = 7): Layout {
  const groups = typeof nodes === 'number' ? Array.from({ length: nodes }, (_, i) => i) : nodes
  const r = rng(seed)
  const count = brainPointsFor(universeAt)
  const points: Neuron[] = cortex(Math.round(count * 0.74), r)
  const surface = points.length

  // Inner neurons: dart throwing so they spread evenly through the volume.
  let minD = 0.07
  let tries = 0
  while (points.length < count) {
    const p = { x: -0.72 + r() * 1.4, y: -0.42 + r() * 0.92, z: -0.53 + r() * 1.06 }
    if (++tries > 4000) {
      minD *= 0.92
      tries = 0
    }
    if (!inBrain(p)) continue
    if (points.some((q, i) => i >= surface && (q.x - p.x) ** 2 + (q.y - p.y) ** 2 + (q.z - p.z) ** 2 < minD * minD)) continue
    points.push({ ...p, b: 0.2 + r() * 0.4, surface: false })
  }

  // Mesh: the cortex links along its surface; inner neurons link to anything near.
  const d2 = (a: P3, b: P3) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
  const seen = new Set<number>()
  const edges: [number, number][] = []
  points.forEach((p, i) => {
    const near: { j: number; d: number }[] = []
    for (let j = 0; j < points.length; j++) {
      if (j === i || (p.surface && !points[j].surface)) continue
      near.push({ j, d: d2(p, points[j]) })
    }
    near.sort((a, b) => a.d - b.d)
    for (const { j } of near.slice(0, p.surface ? 3 : 4)) {
      const [a, b] = i < j ? [i, j] : [j, i]
      if (seen.has(a * 4096 + b)) continue
      seen.add(a * 4096 + b)
      edges.push([a, b])
    }
  })

  // Growth: slots go outward from the core, oldest first, with a minimum gap so neighbouring
  // projects stay distinct and easy to tap. The gap is the largest that still fits the
  // threshold's worth of projects; it depends only on the threshold, so adding a project
  // never moves the earlier ones.
  const byDistance = points.map((p, i) => ({ i, d: d2(p, CORE) })).sort((a, b) => a.d - b.d).map((o) => o.i)
  const spacedWith = (gap: number, stopAt = Infinity) => {
    const out: number[] = []
    for (const i of byDistance) {
      if (out.every((j) => d2(points[i], points[j]) >= gap * gap)) out.push(i)
      if (out.length >= stopAt) break
    }
    return out
  }
  let lo = 0.01
  let hi = 0.6
  for (let k = 0; k < 18; k++) {
    const mid = (lo + hi) / 2
    if (spacedWith(mid, universeAt).length >= universeAt) lo = mid
    else hi = mid
  }
  const spaced = spacedWith(lo)
  const taken = new Set(spaced)
  const order = [...spaced, ...byDistance.filter((i) => !taken.has(i))]

  // Assign in node order (appending a node never changes earlier ones). A project's first node takes
  // the next slot outward; its other parts take the free spaced slots nearest to it.
  const used = new Set<number>()
  const anchorOf = new Map<number, number>()
  const projectSlots: number[] = []
  let cursor = 0
  for (const g of groups) {
    let pick = -1
    const anchor = anchorOf.get(g)
    if (anchor != null) {
      let best = Infinity
      for (const i of spaced) {
        if (used.has(i)) continue
        const d = d2(points[i], points[anchor])
        if (d < best) {
          best = d
          pick = i
        }
      }
    }
    if (pick < 0) {
      while (cursor < order.length && used.has(order[cursor])) cursor++
      if (cursor >= order.length) break
      pick = order[cursor]
    }
    used.add(pick)
    projectSlots.push(pick)
    if (anchor == null) anchorOf.set(g, pick)
  }
  return { points, edges, projectSlots, gap: lo }
}

/**
 * A spiral galaxy in the xz plane (radius about 0.5). Star i's position depends only
 * on i, so the universe also grows outward without moving older stars.
 */
export function galaxyStar(i: number, arms = 3): P3 & { arm: number } {
  const r = rng(1000 + i)
  const arm = i % arms
  const t = 0.06 + Math.min(1, Math.sqrt(i / 400)) * 0.88 // older stars near the core
  const radius = t * 0.46 + (r() - 0.5) * 0.035
  const angle = (arm / arms) * Math.PI * 2 + t * Math.PI * 2.6 + (r() - 0.5) * 0.35
  return { x: Math.cos(angle) * radius, y: (r() - 0.5) * 0.03, z: Math.sin(angle) * radius, arm }
}

/** A project's other parts orbit its star like moons: a small, fixed offset per part. */
export function galaxyMoon(star: P3, j: number): P3 {
  const a = j * 2.39996 + 0.6
  const r = 0.024 + 0.006 * j
  return { x: star.x + Math.cos(a) * r, y: star.y + (j % 2 ? 0.006 : -0.006), z: star.z + Math.sin(a) * r }
}

/** Galaxy dust: a bright bulge, spiral arms, and distant field stars around it. */
export function galaxyDust(count: number, seed = 99, arms = 3): (P3 & { a: number; warm: boolean })[] {
  const r = rng(seed)
  return Array.from({ length: count }, () => {
    const kind = r()
    if (kind < 0.22) {
      // field stars on a far shell, so they drift with parallax as the galaxy turns
      const u = r() * 2 - 1
      const th = r() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const R = 1.3 + r() * 0.8
      return { x: Math.cos(th) * s * R, y: u * R, z: Math.sin(th) * s * R, a: 0.15 + r() * 0.35, warm: false }
    }
    if (kind < 0.42) {
      // bulge
      const R = Math.pow(r(), 2) * 0.12
      const th = r() * Math.PI * 2
      const ph = Math.acos(r() * 2 - 1)
      return { x: Math.sin(ph) * Math.cos(th) * R, y: Math.cos(ph) * R * 0.6, z: Math.sin(ph) * Math.sin(th) * R, a: 0.3 + r() * 0.5, warm: true }
    }
    const t = Math.pow(r(), 0.7)
    const radius = t * 0.47 + (r() - 0.5) * 0.06
    const angle = (Math.floor(r() * arms) / arms) * Math.PI * 2 + t * Math.PI * 2.6 + (r() - 0.5) * 0.6
    return { x: Math.cos(angle) * radius, y: (r() - 0.5) * 0.04 * (1 - t), z: Math.sin(angle) * radius, a: 0.2 + r() * 0.55, warm: t < 0.25 }
  })
}
