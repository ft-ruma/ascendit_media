import { ImageResponse } from 'next/og'
import { getCaseStudies, getCaseStudy } from '@/lib/cms'

export const alt = 'Ascendit case study'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  return (await getCaseStudies()).map((c) => ({ slug: c.slug }))
}

/** Cover frame + client + result, in the window chrome. */
export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const c = await getCaseStudy((await params).slug)
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#F4F4F1', padding: 48 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 22, border: '1px solid #E3E3E0', overflow: 'hidden' }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: '1px solid #E3E3E0', color: '#6B6B75', fontSize: 22 }}>
            <div style={{ width: 16, height: 16, borderRadius: 99, background: '#FF8A3D' }} />
            <div style={{ width: 16, height: 16, borderRadius: 99, background: '#E3E3E0' }} />
            <div style={{ width: 16, height: 16, borderRadius: 99, background: '#2E7BFF' }} />
            <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>{c?.windowFileName ?? 'case-study'}</div>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            {c?.cover?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.cover.url} alt="" width={520} height={518} style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 520, background: '#EDE6DC' }} />
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 48, gap: 20 }}>
              <div style={{ fontSize: 26, color: '#6B6B75' }}>{c?.industry}</div>
              <div style={{ fontSize: 64, color: '#0E0E12', fontWeight: 700, letterSpacing: -2 }}>{c?.client ?? 'Ascendit'}</div>
              <div style={{ fontSize: 34, color: '#0E0E12', lineHeight: 1.25 }}>{c?.result}</div>
              <div style={{ marginTop: 16, fontSize: 24, color: '#1F5FE0' }}>ascendit.dev</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
