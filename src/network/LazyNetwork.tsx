'use client'
import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { ProjectNetwork as PN } from './ProjectNetwork'

type Props = ComponentProps<typeof PN>

// On the home page the network loads after first paint (keeps first-load JS in budget).
// The placeholder matches the canvas size, so nothing shifts when it arrives.
export const LazyNetwork = dynamic<Props>(() => import('./ProjectNetwork').then((m) => m.ProjectNetwork), {
  ssr: false,
  loading: () => <div aria-hidden className="h-[min(64vh,600px)] w-full rounded-[18px] bg-ink max-lg:aspect-[4/3] max-lg:h-auto" />,
})
