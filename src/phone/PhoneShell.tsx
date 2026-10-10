'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const PhoneRuntime = dynamic(() => import('./PhoneRuntime'), { ssr: false })

/** Loads the phone/tablet runtime only when the viewport is under 1024px; desktop never downloads it. */
export function PhoneShell(props: { banner: { title: string; body: string; href: string } | null }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)')
    const update = () => setOn(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return on ? <PhoneRuntime {...props} /> : null
}
