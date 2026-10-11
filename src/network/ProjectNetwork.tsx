'use client'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { haptic } from '@/lib/haptics'
import { PILLAR_NAMES } from '@/lib/pillars'
import { cue } from '@/lib/sound'
import type { PillarKey } from '@/lib/types'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { type P3, brainLayout, cortexDust, galaxyDust, galaxyMoon, galaxyStar } from './geometry'
import type { NetPart, NetProject } from './types'

export type { NetPart, NetProject } from './types'

type Props = {
  projects: NetProject[]
  /** Project count at which the brain becomes a universe (CMS: Home page → Ongoing & completed projects). */
  universeAt: number
  /** "auto" follows the count; the others are for previews (?view=universe). */
  mode?: 'auto' | 'brain' | 'universe'
  variant?: 'section' | 'widget' | 'page'
}

const COLORS: Record<PillarKey, string> = { retail: '#FF8A3D', software: '#B9A6FF', web: '#8EC5FF', brand: '#C8F45A' }
const colorOf = (p: { service: PillarKey }) => COLORS[p.service] ?? COLORS.web
/** A node: one sub-project (or a whole project), with its main project and its place in that project. */
type Node = NetPart & { pi: number; j: number }
const partLabel = (n: Node, p: NetProject) => (n.whole ? p.client : `${p.client} · ${n.title}`)

/** A soft round glow, drawn once per colour and stamped with drawImage (much cheaper than shadowBlur). */
function sprite(color: string, core = '#FFFFFF', size = 64) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, core)
  grad.addColorStop(0.12, color)
  grad.addColorStop(0.35, `${color}55`)
  grad.addColorStop(1, `${color}00`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

/** Camera: yaw turns around the vertical axis, pitch tilts toward the viewer. */
type Cam = { yaw: number; pitch: number }
const VIEW = {
  brain: { yaw: -0.38, pitch: 0.2, spin: 0.14, pitchMin: -0.5, pitchMax: 0.9, D: 3.2 },
  universe: { yaw: 0.3, pitch: 0.78, spin: 0.035, pitchMin: 0.15, pitchMax: 1.45, D: 2.6 },
}

/** Rotates and projects 3D points into flat arrays (x, y on screen, z depth, k perspective). */
function projectAll(src: P3[], cam: Cam, D: number, s: number, cx: number, cy: number, out: { x: Float32Array; y: Float32Array; z: Float32Array; k: Float32Array }) {
  const cyw = Math.cos(cam.yaw)
  const syw = Math.sin(cam.yaw)
  const cp = Math.cos(cam.pitch)
  const sp = Math.sin(cam.pitch)
  for (let i = 0; i < src.length; i++) {
    const p = src[i]
    const x = p.x * cyw + p.z * syw
    const z0 = -p.x * syw + p.z * cyw
    const y = p.y * cp - z0 * sp
    const z = p.y * sp + z0 * cp
    const k = D / (D + z)
    out.x[i] = cx + x * s * k
    out.y[i] = cy + y * s * k
    out.z[i] = z
    out.k[i] = k
  }
}
const buffers = (n: number) => ({ x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), k: new Float32Array(n) })

export function ProjectNetwork({ projects: real, universeAt, mode: modeProp = 'auto', variant = 'section' }: Props) {
  // Previews, read after mount so the static HTML stays cacheable:
  //   ?view=universe | brain   force either state
  //   ?view=grow:60               add placeholder nodes to see the network at 60 projects
  const [preview, setPreview] = useState<{ mode?: Props['mode']; grow?: number } | null>(null)
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('view') ?? ''
    if (q === 'universe' || q === 'brain') setPreview({ mode: q })
    const g = /^grow:(\d{1,4})$/.exec(q)
    if (g) setPreview({ grow: Math.min(1000, Number(g[1])) })
  }, [])
  const projects = useMemo(() => {
    const want = preview?.grow ?? 0
    let have = real.reduce((n, p) => n + p.parts.length, 0)
    if (want <= have) return real
    const keys: PillarKey[] = ['retail', 'software', 'web', 'brand']
    const extra: NetProject[] = []
    const kinds = ['3D design', 'Branding', 'Social media']
    while (have < want) {
      const k = real.length + extra.length + 1
      const size = Math.min(want - have, k % 3 === 0 ? 1 : 3)
      extra.push({
        slug: '', client: `Preview project ${k}`, industry: 'Preview', location: 'LK', pillars: [keys[k % 4]], status: 'completed', metrics: [], publishedAt: '',
        result: 'A placeholder from ?view=grow, to preview how the network fills up.',
        parts: Array.from({ length: size }, (_, j) => ({ title: size === 1 ? `Preview project ${k}` : kinds[j], service: keys[(k + j) % 4], status: 'completed' as const, date: '9999', whole: size === 1 })),
      })
      have += size
    }
    return [...real, ...extra]
  }, [real, preview])
  // Every sub-project is a node; newer work grows further out.
  const nodes = useMemo(() => {
    const all: Node[] = projects.flatMap((p, pi) => p.parts.map((part, j) => ({ ...part, pi, j })))
    return all.sort((x, y) => x.date.localeCompare(y.date) || x.pi - y.pi || x.j - y.j)
  }, [projects])
  /** node indices of each project's parts, in node order */
  const groups = useMemo(() => {
    const out: number[][] = projects.map(() => [])
    nodes.forEach((n, k) => out[n.pi].push(k))
    return out
  }, [projects, nodes])
  const mode = preview?.mode ?? modeProp
  const universe = mode === 'universe' || (mode === 'auto' && nodes.length >= universeAt)
  const canvas = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const screen = useRef<{ x: number; y: number; z: number }[]>([])
  const cam = useRef<Cam & { universe?: boolean }>({ ...VIEW.brain })
  const drag = useRef<{ id: number; x: number; y: number; yaw: number; pitch: number; moved: boolean } | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const sel = useRef<number | null>(null)
  const hov = useRef<number | null>(null)
  sel.current = selected
  hov.current = hover

  // Fixed point count per threshold, so adding a project never re-lays the brain.
  const layout = useMemo(() => brainLayout(universeAt, nodes.map((n) => n.pi)), [universeAt, nodes])

  useEffect(() => {
    const cv = canvas.current
    const box = wrap.current
    if (!cv || !box) return
    const ctx = cv.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const view = universe ? VIEW.universe : VIEW.brain
    if (cam.current.universe !== universe) cam.current = { yaw: view.yaw, pitch: view.pitch, universe }
    const sprites: Record<string, HTMLCanvasElement> = {}
    const glow = (c: string, core?: string) => (sprites[c + (core ?? '')] ??= sprite(c, core))
    const small = variant === 'widget'
    let w = 0
    let h = 0
    let raf = 0
    let running = false
    let visible = false
    let last = performance.now()
    let spin = view.spin
    const start = last

    /* ---------- brain state ---------- */
    const pts = layout.points
    const P = buffers(pts.length)
    const adj: number[][] = pts.map(() => [])
    for (const [a, b] of layout.edges) {
      adj[a].push(b)
      adj[b].push(a)
    }
    const slotOf = new Map(layout.projectSlots.map((pi, k) => [pi, k]))
    const flare = new Float32Array(pts.length) // neurons light up when a signal arrives
    type Pulse = { from: number; to: number; t: number; speed: number; color: string | null; life: number }
    const pulses: Pulse[] = []
    const r = (n: number) => Math.floor(Math.random() * n)
    const spawn = (from: number, color: string | null = null, life = 8) => {
      const to = adj[from][r(adj[from].length)]
      if (to != null) pulses.push({ from, to, t: 0, speed: 1.4 + Math.random() * 1.2, color, life })
    }
    if (!universe) for (let i = 0; i < (small ? 18 : 42); i++) spawn(r(pts.length), null, Infinity)
    let emit = 0
    // The cortex: thousands of fine particles that show the folds; lit brighter at the rim.
    const fine = universe ? [] : cortexDust(small ? 4500 : 10000)
    const F = buffers(fine.length)
    const fineA = new Float32Array(fine.length)
    // Luminous parts are drawn on a layer, then added back blurred (bloom) by scaling down and up.
    const layer = document.createElement('canvas')
    const lc = layer.getContext('2d')!
    const bloom = document.createElement('canvas')
    const bc = bloom.getContext('2d')!

    /* ---------- universe state ---------- */
    const dust = universe ? galaxyDust(small ? 700 : 1500) : []
    const D3 = buffers(dust.length)
    const firsts = groups.filter((g) => g.length).map((g) => g[0]).sort((a, b) => a - b)
    const starOf = new Map(firsts.map((k, ordinal) => [nodes[k].pi, galaxyStar(ordinal)]))
    const stars: P3[] = universe
      ? nodes.map((n, k) => {
          const g = groups[n.pi]
          const star = starOf.get(n.pi)!
          return g[0] === k ? star : galaxyMoon(star, g.indexOf(k))
        })
      : []
    const S = buffers(stars.length)

    const resize = () => {
      const rect = box.getBoundingClientRect()
      w = rect.width
      h = rect.height
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      cv.style.width = `${w}px`
      cv.style.height = `${h}px`
      layer.width = cv.width
      layer.height = cv.height
      bloom.width = Math.max(1, Math.round(w / 5))
      bloom.height = Math.max(1, Math.round(h / 5))
      draw(performance.now())
    }

    const background = (s: number) => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.48, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75)
      bg.addColorStop(0, universe ? '#0B0A24' : '#06143A')
      bg.addColorStop(0.55, '#040818')
      bg.addColorStop(1, '#020309')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
      // volumetric haze behind the subject
      const haze = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, s * (universe ? 0.45 : 0.8))
      haze.addColorStop(0, universe ? 'rgba(255,214,170,.22)' : 'rgba(40,110,255,.20)')
      haze.addColorStop(0.5, universe ? 'rgba(150,120,255,.08)' : 'rgba(30,80,220,.07)')
      haze.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = haze
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter' // everything luminous adds up, like real light
    }

    /** Links each project's parts to its first part (a small constellation per project). */
    const siblings = (at: { x: number; y: number }[], focusGroup: number, unit: number) => {
      ctx.lineWidth = 0.9 * unit
      ctx.strokeStyle = 'rgba(255,255,255,.2)'
      ctx.beginPath()
      groups.forEach((g, gi) => {
        if (gi === focusGroup || g.length < 2 || !at[g[0]]) return
        for (const k of g.slice(1)) if (at[k]) {
          ctx.moveTo(at[g[0]].x, at[g[0]].y)
          ctx.lineTo(at[k].x, at[k].y)
        }
      })
      ctx.stroke()
      const g = groups[focusGroup]
      if (!g || g.length < 2) return
      ctx.lineWidth = 1.8 * unit
      ctx.strokeStyle = 'rgba(255,255,255,.85)'
      ctx.beginPath()
      for (const k of g.slice(1)) if (at[k] && at[g[0]]) {
        ctx.moveTo(at[g[0]].x, at[g[0]].y)
        ctx.lineTo(at[k].x, at[k].y)
      }
      ctx.stroke()
    }

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = reduced ? 0 : (now - start) / 1000
      const focus = sel.current ?? hov.current
      // Turn slowly; hold still while a project is being looked at or dragged.
      const want = focus != null || drag.current ? 0 : view.spin
      spin += (want - spin) * Math.min(1, dt * 3)
      if (!reduced) cam.current.yaw += spin * dt
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // glows shrink a little as the network fills, so neighbours stay distinct
      const dense = Math.max(0.6, 1 - nodes.length / 250)

      if (!universe) {
        const s = Math.min(w / 1.6, h / 1.15)
        const unit = Math.max(0.7, Math.min(1.35, s / 420))
        background(s)
        const cy0 = h / 2 + s * 0.03
        projectAll(pts, cam.current, view.D, s, w / 2, cy0, P)
        projectAll(fine, cam.current, view.D, s, w / 2, cy0, F)
        const depth = (z: number) => Math.min(1, Math.max(0, (0.75 - z) / 1.5)) // 1 near, 0 far
        const focusPt = focus != null ? layout.projectSlots[focus] : -1
        const g = lc
        g.setTransform(1, 0, 0, 1, 0, 0)
        g.clearRect(0, 0, layer.width, layer.height)
        g.setTransform(dpr, 0, 0, dpr, 0, 0)
        g.globalCompositeOperation = 'lighter'

        // cortex particles: grooves dark, crests bright, edges facing sideways glow (rim light)
        const syw = Math.sin(cam.current.yaw)
        const cyw = Math.cos(cam.current.yaw)
        const sp = Math.sin(cam.current.pitch)
        const cp = Math.cos(cam.current.pitch)
        for (let i = 0; i < fine.length; i++) {
          const nn = fine[i].n!
          const nz = nn.y * sp + (-nn.x * syw + nn.z * cyw) * cp // < 0 faces the viewer
          const rim = 1 - Math.abs(nz)
          const lit = nz < 0 ? 0.3 + 1.2 * rim * rim : 0.12 + 0.45 * rim * rim // the far side shows through, dimmer
          fineA[i] = Math.min(1, 1.35 * fine[i].b * fine[i].b * lit * (0.45 + 0.55 * depth(F.z[i])))
        }
        g.fillStyle = '#86C6FF'
        for (let band = 0; band < 6; band++) {
          g.beginPath()
          for (let i = 0; i < fine.length; i++) {
            if (Math.min(5, Math.floor(fineA[i] * 6)) !== band) continue
            const sz = 1.7 * F.k[i] * unit
            g.rect(F.x[i] - sz / 2, F.y[i] - sz / 2, sz, sz)
          }
          g.globalAlpha = (band + 0.6) / 6
          g.fill()
        }
        g.globalAlpha = 1

        // connections, batched by depth into three strokes
        g.lineWidth = 0.55 * unit
        for (let band = 0; band < 3; band++) {
          g.beginPath()
          for (const [a, b] of layout.edges) {
            const n = depth((P.z[a] + P.z[b]) / 2)
            if (Math.min(2, Math.floor(n * 3)) !== band) continue
            g.moveTo(P.x[a], P.y[a])
            g.lineTo(P.x[b], P.y[b])
          }
          g.strokeStyle = ['rgba(40,90,220,.05)', 'rgba(60,130,255,.1)', 'rgba(120,190,255,.17)'][band]
          g.stroke()
        }
        if (focusPt >= 0) {
          g.strokeStyle = colorOf(nodes[focus!])
          g.lineWidth = 1.2 * unit
          g.beginPath()
          for (const j of adj[focusPt]) {
            g.moveTo(P.x[focusPt], P.y[focusPt])
            g.lineTo(P.x[j], P.y[j])
            for (const k of adj[j]) {
              g.moveTo(P.x[j], P.y[j])
              g.lineTo(P.x[k], P.y[k])
            }
          }
          g.globalAlpha = 0.55
          g.stroke()
          g.globalAlpha = 1
        }

        // signals: travel along connections and make neurons fire where they land
        if (!reduced) {
          if (Math.random() < dt * 6) flare[r(pts.length)] = 0.9 // spontaneous firing
          emit += dt
          if (focusPt >= 0 && emit > 0.18) {
            emit = 0
            spawn(focusPt, colorOf(nodes[focus!]), 4)
          }
          for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i]
            p.t += dt * p.speed
            if (p.t < 1) continue
            flare[p.to] = Math.max(flare[p.to], p.color ? 1 : 0.8)
            if (--p.life <= 0) {
              pulses.splice(i, 1)
              continue
            }
            const options = adj[p.to].filter((j) => j !== p.from)
            p.from = p.to
            p.to = options.length ? options[r(options.length)] : adj[p.to][0]
            p.t = 0
          }
          for (let i = 0; i < flare.length; i++) flare[i] *= 1 - dt * 2.2
        }

        // neurons
        const neuron = glow('#3D8BFF', '#DDEEFF')
        for (let i = 0; i < pts.length; i++) {
          if (slotOf.has(i)) continue
          const n = depth(P.z[i])
          const f = flare[i]
          const tw = 0.8 + 0.2 * Math.sin(t * 1.3 + i * 2.1)
          const a = Math.min(1, (0.1 + 0.45 * pts[i].b) * (0.2 + 0.8 * n) * tw + f * 0.9)
          const size = (2 + 2.6 * pts[i].b + f * 7) * P.k[i] * unit * (0.75 + 0.25 * n) * 2.2
          g.globalAlpha = a
          g.drawImage(neuron, P.x[i] - size / 2, P.y[i] - size / 2, size, size)
        }

        // signal heads with short trails
        for (const p of pulses) {
          const spr = glow(p.color ?? '#7FD8FF', '#FFFFFF')
          for (let j = 0; j < 4; j++) {
            const tt = p.t - j * 0.07
            if (tt < 0) break
            const x = P.x[p.from] + (P.x[p.to] - P.x[p.from]) * tt
            const y = P.y[p.from] + (P.y[p.to] - P.y[p.from]) * tt
            const n = depth(P.z[p.from] + (P.z[p.to] - P.z[p.from]) * tt)
            const size = (12 - j * 2.5) * unit * P.k[p.from]
            g.globalAlpha = (0.25 + 0.75 * n) * (1 - j * 0.24)
            g.drawImage(spr, x - size / 2, y - size / 2, size, size)
          }
        }
        g.globalAlpha = 1

        // layer + bloom onto the screen
        ctx.drawImage(layer, 0, 0, w, h)
        bc.clearRect(0, 0, bloom.width, bloom.height)
        bc.drawImage(layer, 0, 0, bloom.width, bloom.height)
        ctx.globalAlpha = 0.85
        ctx.drawImage(bloom, 0, 0, w, h)
        ctx.globalAlpha = 1

        // parts of one project are linked, so a project reads as one group
        screen.current = layout.projectSlots.map((pi) => ({ x: P.x[pi], y: P.y[pi], z: P.z[pi] }))
        const focusGroup = focus != null ? nodes[focus]?.pi : -1
        siblings(screen.current, focusGroup, unit)
        nodes.forEach((node, k) => {
          const pi = layout.projectSlots[k]
          if (pi == null) return
          const on = focus === k
          const kin = node.pi === focusGroup
          const live = node.status === 'in-progress'
          const n = depth(P.z[pi])
          const rr = ((on ? 10 : kin ? 8 : 6.5) * (on || kin ? 1 : dense) + (live ? Math.sin(t * 3 + k) * 1.2 : 0) + flare[pi] * 3) * unit * P.k[pi]
          ctx.globalAlpha = on || kin ? 1 : 0.35 + 0.65 * n
          ctx.drawImage(glow(colorOf(node)), P.x[pi] - rr * 4, P.y[pi] - rr * 4, rr * 8, rr * 8)
          ctx.drawImage(glow(colorOf(node), '#FFFFFF'), P.x[pi] - rr * 1.6, P.y[pi] - rr * 1.6, rr * 3.2, rr * 3.2)
          if (live) {
            ctx.strokeStyle = 'rgba(255,138,61,.8)'
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.arc(P.x[pi], P.y[pi], rr + 4 + ((t * 8) % 8), 0, Math.PI * 2)
            ctx.stroke()
          }
        })
        ctx.globalAlpha = 1
      } else {
        // Universe: a slowly turning spiral galaxy; every project is a star.
        const s = Math.min(w / 1.08, h / 0.82)
        const unit = Math.max(0.7, Math.min(1.35, s / 420))
        background(s)
        projectAll(dust, cam.current, view.D, s, w / 2, h / 2, D3)
        projectAll(stars, cam.current, view.D, s, w / 2, h / 2, S)
        const cool = glow('#9FB8FF', '#FFFFFF')
        const warm = glow('#FFC98A', '#FFF6E8')
        for (let i = 0; i < dust.length; i++) {
          if (D3.k[i] <= 0) continue
          const d = dust[i]
          const size = (d.warm ? 5 : 3.6) * D3.k[i] * unit
          ctx.globalAlpha = d.a * (0.7 + 0.3 * Math.sin(t * 2 + i))
          ctx.drawImage(d.warm ? warm : cool, D3.x[i] - size / 2, D3.y[i] - size / 2, size, size)
        }
        screen.current = stars.map((_, k) => ({ x: S.x[k], y: S.y[k], z: S.z[k] }))
        // the journey: a faint trail along each spiral arm, linking projects in date order
        ctx.strokeStyle = 'rgba(200,244,90,.22)'
        ctx.lineWidth = 0.8
        ctx.beginPath()
        for (let i = 3; i < firsts.length; i++) {
          ctx.moveTo(S.x[firsts[i - 3]], S.y[firsts[i - 3]]) // galaxyStar puts the i-th project on arm i % 3
          ctx.lineTo(S.x[firsts[i]], S.y[firsts[i]])
        }
        ctx.stroke()
        const focusGroup = focus != null ? nodes[focus]?.pi : -1
        siblings(screen.current, focusGroup, unit)
        nodes.forEach((node, k) => {
          const on = focus === k
          const kin = node.pi === focusGroup
          const moon = groups[node.pi][0] !== k
          const rr = (on ? 8 : kin ? 6 : moon ? 3.2 : 4.5) * (on || kin ? 1 : dense) * unit * S.k[k] * (1 + 0.12 * Math.sin(t * 2.4 + k * 1.7))
          ctx.globalAlpha = 1
          ctx.drawImage(glow(colorOf(node)), S.x[k] - rr * 4, S.y[k] - rr * 4, rr * 8, rr * 8)
          ctx.drawImage(glow(colorOf(node), '#FFFFFF'), S.x[k] - rr * 1.4, S.y[k] - rr * 1.4, rr * 2.8, rr * 2.8)
        })
        ctx.globalAlpha = 1
      }
      ctx.globalCompositeOperation = 'source-over'

      // keep the hover label pinned to its node while things move
      const tip = tipRef.current
      const at = hov.current != null && sel.current == null ? screen.current[hov.current] : null
      if (tip && at) tip.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, calc(-100% - 14px))`
    }

    const loop = (now: number) => {
      draw(now)
      if (running) raf = requestAnimationFrame(loop)
    }
    const setRunning = (on: boolean) => {
      if (on === running) return
      running = on
      if (on) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      } else cancelAnimationFrame(raf)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(box)
    // Animate only while on screen; reduced motion draws a single still frame.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      setRunning(visible && !reduced)
      if (visible) draw(performance.now())
    })
    io.observe(box)
    // Selection, hover and dragging must repaint even when paused.
    const repaint = () => !running && visible && draw(performance.now())
    box.addEventListener('network:repaint', repaint)
    return () => {
      setRunning(false)
      ro.disconnect()
      io.disconnect()
      box.removeEventListener('network:repaint', repaint)
    }
  }, [layout, nodes, groups, universe, reduced, variant])

  useEffect(() => {
    wrap.current?.dispatchEvent(new Event('network:repaint'))
  }, [hover, selected])

  const nearest = (clientX: number, clientY: number) => {
    const r = wrap.current!.getBoundingClientRect()
    const x = clientX - r.left
    const y = clientY - r.top
    let best = -1
    let bestD = 22 * 22
    screen.current.forEach((q, i) => {
      const d = (q.x - x) ** 2 + (q.y - y) ** 2 + q.z * 60 // nearer nodes win ties
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    return best === -1 ? null : best
  }

  const open = (i: number | null) => {
    setSelected(i)
    if (i != null) {
      haptic()
      void cue('windowOpen')
    }
  }

  // Drag to turn the brain (or tilt the galaxy); a tap without dragging picks a node.
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw: cam.current.yaw, pitch: cam.current.pitch, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (d && d.id === e.pointerId && (e.buttons || e.pointerType !== 'mouse')) {
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      if (!d.moved && Math.abs(dx) + Math.abs(dy) > 6) {
        d.moved = true
        wrap.current?.setPointerCapture(e.pointerId)
        setHover(null)
      }
      if (d.moved) {
        const v = cam.current.universe ? VIEW.universe : VIEW.brain
        cam.current.yaw = d.yaw + dx * 0.008
        cam.current.pitch = Math.max(v.pitchMin, Math.min(v.pitchMax, d.pitch + dy * 0.006))
        wrap.current?.dispatchEvent(new Event('network:repaint'))
      }
      return
    }
    if (e.pointerType === 'mouse') setHover(nearest(e.clientX, e.clientY))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (d && !d.moved) open(nearest(e.clientX, e.clientY))
  }

  const n = nodes.length
  const tall = variant === 'page' ? 'h-[min(72vh,680px)]' : variant === 'widget' ? 'aspect-[4/3]' : 'h-[min(64vh,600px)]'
  const shown = selected ?? hover
  const sel_ = selected != null ? nodes[selected] : null

  return (
    <div className="grid gap-4">
      <div
        ref={wrap}
        className={`relative w-full touch-pan-y select-none overflow-hidden rounded-[18px] bg-ink ${tall} ${hover != null ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        onPointerLeave={() => setHover(null)}
      >
        <canvas ref={canvas} aria-hidden className="absolute inset-0" />
        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap items-center gap-2 font-mono text-[12px] text-white/85">
          <span className="rounded-pill bg-white/10 px-2.5 py-1 backdrop-blur">{universe ? 'universe.app' : 'projects.app'}</span>
          <span className="rounded-pill bg-white/10 px-2.5 py-1 backdrop-blur">
            {n} {n === 1 ? 'project' : 'projects'} {universe ? 'in orbit' : 'connected'}
          </span>
          {projects.length !== n && variant !== 'widget' && (
            <span className="rounded-pill bg-white/10 px-2.5 py-1 backdrop-blur">from {projects.length} main projects</span>
          )}
        </div>
        {variant !== 'widget' && (
          <p className="pointer-events-none absolute right-4 top-4 hidden font-mono text-[12px] text-white/60 sm:block">Drag to turn</p>
        )}
        {!universe && variant !== 'widget' && (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:right-auto sm:w-72">
            <p className="mb-1.5 font-mono text-[12px] text-white/85">
              {Math.max(0, universeAt - n)} more projects until this becomes a universe
            </p>
            <span className="block h-1.5 overflow-hidden rounded-full bg-white/15">
              <span className="block h-full rounded-full bg-gradient-to-r from-aqua to-lilac" style={{ width: `${Math.min(100, (n / universeAt) * 100)}%` }} />
            </span>
          </div>
        )}
        {hover != null && selected == null && nodes[hover] && (
          <span
            ref={tipRef}
            className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap rounded-pill bg-window px-3 py-1 text-[13px] font-medium text-ink shadow-window"
            style={screen.current[hover] ? { transform: `translate(${screen.current[hover].x}px, ${screen.current[hover].y}px) translate(-50%, calc(-100% - 14px))` } : undefined}
          >
            {partLabel(nodes[hover], projects[nodes[hover].pi])}
          </span>
        )}
        {sel_ && (
          <Detail
            node={sel_}
            project={projects[sel_.pi]}
            parts={groups[sel_.pi].map((k) => ({ k, node: nodes[k] }))}
            onPick={(k) => open(k)}
            onClose={() => setSelected(null)}
            compact={variant === 'widget'}
          />
        )}
      </div>

      {variant !== 'widget' && (
        <div>
          <p className="mb-2 font-mono text-[12px] text-graphite">
            Tap a {universe ? 'star' : 'glowing node'} or pick a project. Each part of a project is its own node; colour shows the service and a pulsing ring means it is ongoing.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Ongoing and completed projects">
            {projects.map((p, pi) => {
              const parts = groups[pi]
              if (parts.length === 1 && nodes[parts[0]].whole)
                return (
                  <li key={p.slug || p.client}>
                    <Chip node={nodes[parts[0]]} label={p.client} pressed={selected === parts[0]} active={shown === parts[0]} onClick={() => open(selected === parts[0] ? null : parts[0])} onFocus={() => setHover(parts[0])} onBlur={() => setHover(null)} />
                  </li>
                )
              return (
                <li key={p.slug || p.client} className="flex flex-wrap items-center gap-1.5 rounded-[24px] border border-hairline bg-window/60 py-1 pl-3.5 pr-1">
                  <span className="mr-1 text-[14px] font-medium">{p.client}</span>
                  {parts.map((k) => (
                    <Chip key={k} node={nodes[k]} label={nodes[k].title} aria={`${p.client}: ${nodes[k].title}`} pressed={selected === k} active={shown === k} onClick={() => open(selected === k ? null : k)} onFocus={() => setHover(k)} onBlur={() => setHover(null)} small />
                  ))}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function Chip(props: { node: Node; label: string; aria?: string; pressed: boolean; active: boolean; small?: boolean; onClick: () => void; onFocus: () => void; onBlur: () => void }) {
  const { node, label, active, small } = props
  return (
    <button
      type="button"
      aria-pressed={props.pressed}
      aria-label={props.aria}
      onClick={props.onClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      className={`flex min-h-11 items-center gap-2 rounded-pill border px-3.5 transition ${small ? 'text-[13px]' : 'text-[14px]'} ${active ? 'border-ink bg-ink text-window' : 'border-hairline bg-window text-ink'}`}
    >
      <span aria-hidden className="size-2.5 rounded-full" style={{ background: colorOf(node) }} />
      {label}
      {node.status === 'in-progress' && <span className="text-[12px] opacity-75">· ongoing</span>}
    </button>
  )
}

function Detail({ node, project: p, parts, onPick, onClose, compact }: { node: Node; project: NetProject; parts: { k: number; node: Node }[]; onPick: (k: number) => void; onClose: () => void; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose, p.slug, node.title])
  const ongoing = node.status === 'in-progress'
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-label={node.whole ? p.client : `${p.client}: ${node.title}`}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className={`folder-pop absolute z-20 grid max-h-[calc(100%-24px)] gap-2 overflow-y-auto rounded-[20px] border border-white/60 bg-window/95 p-4 text-ink shadow-lift outline-none backdrop-blur-xl ${
        compact ? 'inset-x-3 bottom-3' : 'bottom-4 right-4 w-[min(92%,360px)] max-sm:inset-x-3 max-sm:w-auto'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[12px] text-graphite">
            {p.industry} · {p.location === 'LK' ? 'Sri Lanka' : 'International'}
          </p>
          <h3 className="text-[19px] font-semibold tracking-tight">{p.client}</h3>
          {!node.whole && (
            <p className="mt-0.5 text-[15px] font-medium">
              <span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-full" style={{ background: colorOf(node) }} />
              {node.title}
              <span className="font-normal text-graphite"> · {PILLAR_NAMES[node.service]}</span>
            </p>
          )}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="-m-1.5 grid size-11 shrink-0 place-items-center rounded-full hover:bg-ink/5">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <p className={`w-fit rounded-pill px-2.5 py-0.5 text-[13px] font-medium ${ongoing ? 'bg-tangerine/25' : 'bg-lime/40'}`}>
        {ongoing ? `Ongoing${node.whole && p.progress ? `: ${p.progress}` : ''}` : 'Completed'}
      </p>
      <p className="text-[15px] leading-snug text-ink/85">{node.summary || p.result}</p>
      {!compact && node.whole && p.metrics.length > 0 && (
        <dl className="flex gap-5">
          {p.metrics.slice(0, 2).map((m) => (
            <div key={m.label}>
              <dd className="text-[20px] font-semibold tabular-nums">{m.value}<span className="text-[13px]">{m.unit}</span></dd>
              <dt className="text-[12px] text-graphite">{m.label}</dt>
            </div>
          ))}
        </dl>
      )}
      {parts.length > 1 ? (
        <div>
          <p className="mb-1 text-[12px] text-graphite">{parts.length} parts of this project, each counted as a project</p>
          <div className="flex flex-wrap gap-1.5">
            {parts.map(({ k, node: x }) => (
              <button
                key={k}
                type="button"
                aria-pressed={x === node}
                onClick={() => onPick(k)}
                className={`flex min-h-8 items-center gap-1.5 rounded-pill border px-2.5 text-[12px] ${x === node ? 'border-ink bg-ink text-window' : 'border-hairline'}`}
              >
                <span aria-hidden className="size-2 rounded-full" style={{ background: colorOf(x) }} />
                {x.title}
                {x.status === 'in-progress' && <span className="opacity-75">· ongoing</span>}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {p.pillars.map((x) => (
            <span key={x} className="flex items-center gap-1.5 rounded-pill border border-hairline px-2 py-0.5 text-[12px]">
              <span aria-hidden className="size-2 rounded-full" style={{ background: COLORS[x] }} />
              {PILLAR_NAMES[x]}
            </span>
          ))}
        </div>
      )}
      {p.slug && (
        <Link href={`/work/${p.slug}`} className="mt-1 text-[15px] font-medium text-aqua-deep underline-offset-4 hover:underline">
          Open the project →
        </Link>
      )}
    </div>
  )
}
