'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeLocalStorage } from './safe-storage'

// In-site comfort settings (Control Center). "Reduce motion" here works on top
// of the OS setting: either one turns animation into fades and stops loops.
type Comfort = { reduceMotion: boolean; setReduceMotion: (on: boolean) => void }

export const useComfort = create<Comfort>()(
  persist(
    (set) => ({
      reduceMotion: false,
      setReduceMotion: (reduceMotion) => {
        applyReduceMotion(reduceMotion)
        set({ reduceMotion })
      },
    }),
    {
      name: 'ascendit-comfort',
      storage: safeLocalStorage,
      skipHydration: true, // rehydrated after mount so server markup always matches
      onRehydrateStorage: () => (s) => s && applyReduceMotion(s.reduceMotion),
    },
  ),
)

function applyReduceMotion(on: boolean) {
  if (typeof document === 'undefined') return
  if (on) document.documentElement.setAttribute('data-reduce-motion', '')
  else document.documentElement.removeAttribute('data-reduce-motion')
}
