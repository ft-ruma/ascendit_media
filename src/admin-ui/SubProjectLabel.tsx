'use client'
import { useRowLabel } from '@payloadcms/ui'

/** Sub-project rows read "3D design · Ongoing" instead of "Sub-project 01". */
export function SubProjectLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string; stage?: string }>()
  const n = String((rowNumber ?? 0) + 1).padStart(2, '0')
  if (!data?.title) return <span>Sub-project {n}</span>
  return (
    <span>
      {data.title}
      <span style={{ opacity: 0.6 }}> · {data.stage === 'in-progress' ? 'Ongoing' : 'Completed'}</span>
    </span>
  )
}
