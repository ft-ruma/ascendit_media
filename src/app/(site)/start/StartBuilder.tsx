'use client'
import { useEffect } from 'react'
import { Builder } from '@/builder/Builder'
import { PILLARS, PRODUCTS, type Pillar, type ProductSlug } from '@/builder/schema'
import { useBuilder } from '@/builder/store'
import type { RateCard } from '@/lib/types'

export function StartBuilder({ rateCard }: { rateCard: RateCard }) {
  useEffect(() => {
    const sp = new URLSearchParams(location.search)
    const pillar = sp.get('pillar') as Pillar | null
    const product = sp.get('product') as ProductSlug | null
    void Promise.resolve(useBuilder.persist.rehydrate()).then(() => {
      const s = useBuilder.getState()
      const what = { ...s.draft.what }
      if (pillar && PILLARS.includes(pillar) && !what.pillars.includes(pillar)) what.pillars = [...what.pillars, pillar]
      if (product && PRODUCTS.includes(product) && !what.products.includes(product)) what.products = [...what.products, product]
      s.patch('what', what)
      useBuilder.setState({ source: sp.get('utm_source') ? `start-${sp.get('utm_source')}` : 'start' })
    })
  }, [])
  return <Builder rateCard={rateCard} variant="page" />
}
