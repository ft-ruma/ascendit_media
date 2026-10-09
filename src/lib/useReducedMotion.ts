'use client'
import { useReducedMotion as useMotionReduced } from 'motion/react'

/** One hook for every reduced-motion decision (loops, boot, sound, typing). */
export function useReducedMotion() {
  return !!useMotionReduced()
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
