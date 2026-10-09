import type { MetadataRoute } from 'next'
import { getCareers, getCaseStudies, getPillars, getProducts } from '@/lib/cms'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pillars, cases, products, careers] = await Promise.all([getPillars(), getCaseStudies(), getProducts(), getCareers()])
  const u = (path: string, priority = 0.6, lastModified?: string) => ({ url: `${SITE_URL}${path}`, priority, lastModified: lastModified ? new Date(lastModified) : undefined })
  return [
    u('/', 1),
    ...pillars.map((p) => u(`/services/${p.slug}`, p.key === 'retail' ? 0.95 : 0.9)),
    u('/products', 0.8),
    ...products.map((p) => u(`/products/${p.slug}`, 0.85)),
    u('/work', 0.8),
    ...cases.map((c) => u(`/work/${c.slug}`, 0.7, c.publishedAt)),
    u('/studio', 0.5),
    u('/careers', 0.4),
    ...careers.map((c) => u(`/careers/${c.slug}`, 0.3)),
    u('/start', 0.8),
    u('/contact', 0.6),
    u('/legal/privacy', 0.1),
    u('/legal/terms', 0.1),
  ]
}
