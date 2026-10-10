import { getCaseStudies } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { Photos, type Photo } from '@/phone/Photos'
import { PageHero, PageWindow } from '@/sections/PageWindow'

export const metadata = pageMeta({
  title: 'Photos: store renders and finished stores',
  description: 'D5 renders and photos of retail stores designed by Ascendit in Sri Lanka.',
  path: '/photos',
})

// Until real renders are uploaded these show as labelled slates.
const RENDERS = [
  'Grocery flagship, entrance', 'Pharmacy counter', 'Boutique fitting area', 'Hardware aisle', 'Café counter',
  'Mall kiosk', 'Checkout zone', 'Fresh produce wall', 'Window display',
]

export default async function PhotosPage() {
  const cases = await getCaseStudies()
  const fromCases: Photo[] = cases.flatMap((c) => [
    ...(c.cover?.url ? [{ src: c.cover.url, alt: c.cover.alt, caption: `${c.client}` }] : []),
    ...c.gallery.map((g) => ({ src: g.url, alt: g.alt, caption: c.client })),
  ])
  const photos: Photo[] = [...fromCases, ...RENDERS.map((r) => ({ alt: r, caption: `${r} (D5 render)` }))]
  return (
    <PageWindow file="Photos">
      <PageHero eyebrow="Photos" title="Photos" intro="Renders and finished stores. Tap to open, pinch to zoom, swipe for the next one." />
      <section aria-label="Gallery" className="p-1 sm:p-4">
        <Photos photos={photos} />
      </section>
    </PageWindow>
  )
}
