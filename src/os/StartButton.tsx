'use client'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useBuilder } from '@/builder/store'
import type { Pillar, ProductSlug } from '@/builder/schema'

type Props = {
  children?: ReactNode
  className?: string
  pillar?: Pillar
  product?: ProductSlug
  source: string
}

/** Opens the builder modal (pre-filled); a real link to /start without JS or with a modifier key. */
export function StartButton({ children = 'Start a project', className = 'btn-aqua', pillar, product, source }: Props) {
  const open = useBuilder((s) => s.openModal)
  const qs = new URLSearchParams()
  if (pillar) qs.set('pillar', pillar)
  if (product) qs.set('product', product)
  const href = `/start${qs.size ? `?${qs}` : ''}`
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        open({ pillar, product, source })
      }}
    >
      {children}
    </Link>
  )
}
