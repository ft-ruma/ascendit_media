'use client'
import { create } from 'zustand'

// Phone OS state: Control Center, the island's transient activities, banners.
type Flash = { kind: 'sent'; reference: string } | { kind: 'note'; text: string }

type PhoneState = {
  controlCenter: boolean
  setControlCenter: (open: boolean) => void
  flash: Flash | null
  showFlash: (f: Flash, ms?: number) => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const usePhone = create<PhoneState>((set) => ({
  controlCenter: false,
  setControlCenter: (controlCenter) => set({ controlCenter }),
  flash: null,
  showFlash: (flash, ms = 4500) => {
    clearTimeout(timer)
    set({ flash })
    timer = setTimeout(() => set({ flash: null }), ms)
  },
}))

/** Phone = under 768px, tablet = 768 to 1023px. Desktop never runs phone code. */
export const isPhoneOrTablet = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023.98px)').matches
export const isPhone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767.98px)').matches
