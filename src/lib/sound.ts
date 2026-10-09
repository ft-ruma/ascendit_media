'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { prefersReducedMotion } from './useReducedMotion'

// Every cue goes through cue(), so "off by default", the volume cap and
// reduced motion cannot be bypassed. No cue is wired to hover or scroll.

export type CueName =
  | 'boot'
  | 'windowOpen'
  | 'windowClose'
  | 'dockLift'
  | 'builderStep'
  | 'estimateReady'
  | 'briefSent'
  | 'error'

// Real Bend Studios files go in /public/sounds as <name>.opus + <name>.mp3 and
// get listed here. Until then each cue is synthesised as a placeholder.
const CUE_FILES: Partial<Record<CueName, string>> = {}

const MAX_VOLUME = 0.6

type SoundState = {
  enabled: boolean
  volume: number
  setEnabled: (on: boolean) => void
}

export const useSound = create<SoundState>()(
  persist(
    (set) => ({
      enabled: false,
      volume: 0.3,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: 'ascendit-sound', partialize: (s) => ({ enabled: s.enabled, volume: s.volume }) },
  ),
)

let audio: AudioContext | null = null
let master: GainNode | null = null
const buffers = new Map<CueName, AudioBuffer>()

const ctx = () => {
  audio ??= new AudioContext()
  if (!master) {
    master = audio.createGain()
    master.connect(audio.destination)
  }
  return audio
}

/** Only the sound toggle calls this: browsers need a user gesture to start audio. */
export async function enableSound() {
  const c = ctx()
  if (c.state === 'suspended') await c.resume()
  useSound.getState().setEnabled(true)
  // Preload after the toggle is on, never before.
  await Promise.all((Object.keys(SYNTH) as CueName[]).map((n) => load(n).catch(() => null)))
}

export function disableSound() {
  useSound.getState().setEnabled(false)
  bed?.pause()
}

async function load(name: CueName): Promise<AudioBuffer> {
  const cached = buffers.get(name)
  if (cached) return cached
  const c = ctx()
  let buf: AudioBuffer
  const file = CUE_FILES[name]
  if (file) {
    const canOpus = new Audio().canPlayType('audio/ogg; codecs=opus') !== ''
    const res = await fetch(`${file}.${canOpus ? 'opus' : 'mp3'}`)
    buf = await c.decodeAudioData(await res.arrayBuffer())
  } else {
    buf = synth(c, SYNTH[name])
  }
  buffers.set(name, buf)
  return buf
}

export async function cue(name: CueName) {
  const { enabled, volume } = useSound.getState()
  if (!enabled || prefersReducedMotion() || !audio) return // off by default; reduced motion keeps it off
  const buf = buffers.get(name) ?? (await load(name))
  const c = ctx()
  const src = c.createBufferSource()
  const g = c.createGain()
  g.gain.value = Math.min(volume, MAX_VOLUME)
  src.buffer = buf
  src.connect(g).connect(master!)
  src.start()
}

/* ---------- ambient bed: streamed <audio> through the same graph ---------- */

let bed: HTMLAudioElement | null = null
let bedGain: GainNode | null = null

export function playBed(url: string) {
  const { enabled, volume } = useSound.getState()
  if (!enabled || prefersReducedMotion()) return
  const c = ctx()
  if (!bed) {
    bed = new Audio(url)
    bed.loop = true
    bed.crossOrigin = 'anonymous'
    bedGain = c.createGain()
    c.createMediaElementSource(bed).connect(bedGain).connect(master!)
  }
  bedGain!.gain.value = Math.min(volume, MAX_VOLUME) * 0.5
  void bed.play()
}

/** Duck the bed to 20% while any video with sound plays. */
export function duckBed(on: boolean) {
  if (!bedGain || !audio) return
  const target = Math.min(useSound.getState().volume, MAX_VOLUME) * 0.5 * (on ? 0.2 : 1)
  bedGain.gain.setTargetAtTime(target, audio.currentTime, 0.15)
}

/* ---------- placeholder synth ---------- */

type Note = { f: number; t: number; d: number; type?: 'sine' | 'triangle' }
const SYNTH: Record<CueName, Note[]> = {
  boot: [{ f: 523.25, t: 0, d: 0.5 }, { f: 659.25, t: 0.09, d: 0.5 }, { f: 783.99, t: 0.18, d: 0.7 }],
  windowOpen: [{ f: 880, t: 0, d: 0.09, type: 'triangle' }, { f: 1318.5, t: 0.04, d: 0.12 }],
  windowClose: [{ f: 1046.5, t: 0, d: 0.08, type: 'triangle' }, { f: 659.25, t: 0.04, d: 0.12 }],
  dockLift: [{ f: 587.33, t: 0, d: 0.12 }, { f: 880, t: 0.06, d: 0.16 }],
  builderStep: [{ f: 987.77, t: 0, d: 0.07, type: 'triangle' }],
  estimateReady: [{ f: 659.25, t: 0, d: 0.2 }, { f: 830.61, t: 0.08, d: 0.2 }, { f: 987.77, t: 0.16, d: 0.35 }],
  briefSent: [{ f: 783.99, t: 0, d: 0.15 }, { f: 1046.5, t: 0.1, d: 0.15 }, { f: 1567.98, t: 0.2, d: 0.4 }],
  error: [{ f: 311.13, t: 0, d: 0.12, type: 'triangle' }, { f: 277.18, t: 0.1, d: 0.18, type: 'triangle' }],
}

function synth(c: BaseAudioContext, notes: Note[]): AudioBuffer {
  const sr = c.sampleRate
  const len = Math.ceil(sr * Math.max(...notes.map((n) => n.t + n.d)) + sr * 0.05)
  const buf = c.createBuffer(1, len, sr)
  const out = buf.getChannelData(0)
  for (const n of notes) {
    const start = Math.floor(n.t * sr)
    const dur = Math.floor(n.d * sr)
    for (let i = 0; i < dur && start + i < len; i++) {
      const t = i / sr
      const env = Math.min(1, i / (sr * 0.004)) * Math.exp((-5 * i) / dur)
      const ph = 2 * Math.PI * n.f * t
      const wave = n.type === 'triangle' ? (2 / Math.PI) * Math.asin(Math.sin(ph)) : Math.sin(ph)
      out[start + i] += wave * env * 0.35
    }
  }
  return buf
}
