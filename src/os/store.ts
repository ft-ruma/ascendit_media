'use client'
import { create } from 'zustand'

// Window manager: focus raises z-index; Escape closes the focused overlay.
type WindowState = {
  focused: string | null
  zOrder: string[]
  minimised: string[]
  overlays: string[]
  open: (id: string, opts?: { overlay?: boolean }) => void
  focus: (id: string) => void
  close: (id: string) => void
  minimise: (id: string) => void
  restore: (id: string) => void
}

const raise = (order: string[], id: string) => [...order.filter((x) => x !== id), id]

export const useWindows = create<WindowState>((set) => ({
  focused: null,
  zOrder: [],
  minimised: [],
  overlays: [],
  open: (id, opts) =>
    set((s) => ({
      focused: id,
      zOrder: raise(s.zOrder, id),
      minimised: s.minimised.filter((x) => x !== id),
      overlays: opts?.overlay ? [...new Set([...s.overlays, id])] : s.overlays,
    })),
  focus: (id) => set((s) => (s.focused === id ? s : { focused: id, zOrder: raise(s.zOrder, id) })),
  close: (id) =>
    set((s) => {
      const zOrder = s.zOrder.filter((x) => x !== id)
      return {
        zOrder,
        overlays: s.overlays.filter((x) => x !== id),
        focused: s.focused === id ? (zOrder.at(-1) ?? null) : s.focused,
      }
    }),
  minimise: (id) =>
    set((s) => ({ minimised: [...new Set([...s.minimised, id])], focused: s.focused === id ? null : s.focused })),
  restore: (id) => set((s) => ({ minimised: s.minimised.filter((x) => x !== id) })),
}))

export const zIndexOf = (zOrder: string[], id: string) => {
  const i = zOrder.indexOf(id)
  return i === -1 ? undefined : 10 + i
}
