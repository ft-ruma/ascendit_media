'use client'
import { create } from 'zustand'
import type { Accent } from '@/lib/types'

type Zoom = { rect: DOMRect | null; accent?: Accent; href: string | null; start: (rect: DOMRect, href: string, accent?: Accent) => void; end: () => void }

export const useZoom = create<Zoom>((set) => ({
  rect: null,
  href: null,
  start: (rect, href, accent) => set({ rect, href, accent }),
  end: () => set({ rect: null, href: null }),
}))

export const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
