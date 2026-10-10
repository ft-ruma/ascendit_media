'use client'
import { useReducedMotion as useMotionReduced } from 'motion/react'
import { useComfort } from './comfort'

/** One hook for every reduced-motion decision (loops, boot, sound, typing): OS setting or the in-site toggle. */
export function useReducedMotion() {
  const os = !!useMotionReduced()
  const site = useComfort((s) => s.reduceMotion)
  return os || site
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-reduce-motion')
}
