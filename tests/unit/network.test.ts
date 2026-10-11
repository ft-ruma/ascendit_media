import { describe, expect, it } from 'vitest'
import { brainLayout, brainPointsFor, galaxyStar, inBrain } from '@/network/geometry'
import { toNet } from '@/network/toNet'
import { countNodes } from '@/network/types'
import { caseStudies } from '@/seed/data'

const dist = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)

describe('project network geometry', () => {
  it('is deterministic', () => {
    expect(brainLayout(100, 10)).toEqual(brainLayout(100, 10))
  })

  it('builds a 3D brain: cortex on the outside, neurons inside', () => {
    const { points } = brainLayout(100, 0)
    expect(points).toHaveLength(brainPointsFor(100))
    const surface = points.filter((p) => p.surface)
    expect(surface.length).toBeGreaterThan(points.length * 0.6)
    // inner neurons are strictly inside; cortex points sit just under the outer surface
    for (const p of points.filter((q) => !q.surface)) expect(inBrain(p)).toBe(true)
    // both hemispheres, with depth: real width, not a flat picture
    expect(Math.min(...points.map((p) => p.z))).toBeLessThan(-0.4)
    expect(Math.max(...points.map((p) => p.z))).toBeGreaterThan(0.4)
    // nothing in the gap between the hemispheres (above the brainstem)
    expect(points.some((p) => Math.abs(p.z) < 0.02 && p.y < 0.1)).toBe(false)
  })

  it('adding a project never moves existing ones', () => {
    const a = brainLayout(100, 12)
    const b = brainLayout(100, 13)
    expect(b.projectSlots.slice(0, 12)).toEqual(a.projectSlots)
    expect(b.projectSlots.slice(0, 12).map((i) => b.points[i])).toEqual(a.projectSlots.map((i) => a.points[i]))
  })

  it('has a distinct spaced node for every project up to the universe threshold', () => {
    for (const at of [100, 150]) {
      const { points, projectSlots, gap } = brainLayout(at, at)
      expect(projectSlots).toHaveLength(at)
      expect(gap).toBeGreaterThan(0.1)
      projectSlots.forEach((a, k) => {
        for (const b of projectSlots.slice(0, k)) expect(dist(points[a], points[b])).toBeGreaterThanOrEqual(gap - 1e-9)
      })
    }
  })

  it('grows outward: older projects sit nearer the core', () => {
    const { points, projectSlots } = brainLayout(100, 100)
    const core = { x: -0.05, y: -0.1, z: -0.22 }
    const avg = (ks: number[]) => ks.reduce((s, i) => s + dist(points[i], core), 0) / ks.length
    expect(avg(projectSlots.slice(0, 10))).toBeLessThan(avg(projectSlots.slice(-10)))
  })

  it('connects every point to the network', () => {
    const { points, edges } = brainLayout(100, 0)
    expect(new Set(edges.flat()).size).toBe(points.length)
  })

  it('places galaxy stars by index only, older nearer the core', () => {
    expect(galaxyStar(42)).toEqual(galaxyStar(42))
    const d = (i: number) => Math.hypot(galaxyStar(i).x, galaxyStar(i).z)
    expect(d(0)).toBeLessThan(d(300))
  })

  it('counts every sub-project as one project (a project without parts counts as one)', () => {
    const net = toNet(caseStudies)
    expect(net.map((p) => p.parts.length)).toEqual([1, 3, 1, 3]) // oldest first: clinic, tea, pharmacy, grocer
    expect(countNodes(net)).toBe(8)
    expect(net[0].parts[0]).toMatchObject({ whole: true, title: 'Sample Clinic Group' })
    expect(net[1].parts[2]).toMatchObject({ title: 'Social media marketing', status: 'in-progress', date: '2026-09-01' })
  })

  it("keeps a project's parts together, and appending never moves earlier nodes", () => {
    // groups: project 0 has 1 part, project 1 has 3, project 2 has 1, project 3 has 3
    const groups = [0, 1, 1, 1, 2, 3, 3, 3]
    const { points, projectSlots, gap } = brainLayout(100, groups)
    const d = (a: number, b: number) => dist(points[projectSlots[a]], points[projectSlots[b]])
    // a part sits closer to its own project's first part than unrelated projects do, on average
    const own = (d(1, 2) + d(1, 3) + d(5, 6) + d(5, 7)) / 4
    const other = (d(1, 5) + d(0, 4) + d(1, 4) + d(0, 5)) / 4
    expect(own).toBeLessThan(other)
    expect(own).toBeLessThan(gap * 2.2)
    expect(brainLayout(100, [...groups, 3, 4]).projectSlots.slice(0, 8)).toEqual(projectSlots)
  })
})
