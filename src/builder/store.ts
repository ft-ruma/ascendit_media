'use client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Answers, Contact, Pillar, ProductSlug, Step } from './schema'
import { STEPS } from './schema'

export type Draft = {
  what: Answers['what']
  business: Partial<Answers['business']>
  scope: Partial<Record<Pillar, Record<string, unknown>>>
  timeline?: Answers['timeline']
  budget?: string
  contact: Partial<Contact>
}

type Status = 'editing' | 'sending' | 'sent'

type BuilderState = {
  draft: Draft
  step: number
  status: Status
  reference: string | null
  modalOpen: boolean
  source: string
  partialKey: string | null
  openModal: (p?: { pillar?: Pillar; product?: ProductSlug; source?: string; step?: number }) => void
  closeModal: () => void
  patch: <K extends keyof Draft>(key: K, value: Draft[K]) => void
  setStep: (i: number) => void
  setStatus: (s: Status, reference?: string | null) => void
  markPartial: (key: string) => void
  reset: () => void
}

const empty = (): Draft => ({ what: { pillars: [], products: [] }, business: { registered: false }, scope: {}, contact: { bestTime: 'any' } })

export const useBuilder = create<BuilderState>()(
  persist(
    (set) => ({
      draft: empty(),
      step: 0,
      status: 'editing',
      reference: null,
      modalOpen: false,
      source: 'unknown',
      partialKey: null,
      openModal: (p) =>
        set((s) => {
          const draft = s.status === 'sent' ? empty() : { ...s.draft, what: { ...s.draft.what } }
          if (p?.pillar && !draft.what.pillars.includes(p.pillar)) draft.what.pillars = [...draft.what.pillars, p.pillar]
          if (p?.product && !draft.what.products.includes(p.product)) draft.what.products = [...draft.what.products, p.product]
          return {
            draft,
            modalOpen: true,
            source: p?.source ?? s.source,
            status: s.status === 'sent' ? 'editing' : s.status,
            step: p?.step ?? (s.status === 'sent' ? 0 : s.step),
          }
        }),
      closeModal: () => set({ modalOpen: false }),
      patch: (key, value) => set((s) => ({ draft: { ...s.draft, [key]: value } })),
      setStep: (step) => set({ step: Math.max(0, Math.min(STEPS.length - 1, step)) }),
      setStatus: (status, reference = null) => set({ status, reference }),
      markPartial: (partialKey) => set({ partialKey }),
      reset: () => set({ draft: empty(), step: 0, status: 'editing', reference: null, partialKey: null }),
    }),
    {
      name: 'ascendit-builder',
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true, // rehydrated in an effect so SSR markup matches
      partialize: (s) => ({ draft: s.draft, step: s.step, status: s.status, reference: s.reference, source: s.source, partialKey: s.partialKey }),
    },
  ),
)

export const stepName = (i: number): Step => STEPS[i]
