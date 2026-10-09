'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Old one-page anchors never reach the server, so map them here.
const MAP: Record<string, string> = { '#services': '/services/retail-design', '#pricing': '/products', '#work': '/work', '#contact': '/contact', '#about': '/studio' }

export function HashRedirect() {
  const router = useRouter()
  useEffect(() => {
    const to = MAP[location.hash.toLowerCase()]
    if (to) router.replace(to)
  }, [router])
  return null
}
