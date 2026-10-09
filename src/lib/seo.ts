import type { Metadata } from 'next'
import type { CaseStudy, Pillar, Product, Settings } from './types'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ascendit.dev'

export function pageMeta({ title, description, path, image }: { title: string; description: string; path: string; image?: string | null }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, ...(image ? { images: [image] } : {}) },
  }
}

export function organizationJsonLd(s: Settings) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#org`,
        name: 'Ascendit Media',
        url: SITE_URL,
        logo: `${SITE_URL}/wordmark.svg`,
        email: s.email,
        sameAs: s.socials.map((x) => x.url),
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#office`,
        name: 'Ascendit Media',
        parentOrganization: { '@id': `${SITE_URL}/#org` },
        url: SITE_URL,
        telephone: s.phone,
        email: s.email,
        address: { '@type': 'PostalAddress', streetAddress: s.office.line1, addressLocality: s.office.city, addressCountry: 'LK' },
        areaServed: ['LK', 'Worldwide'],
      },
    ],
  }
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}

export function serviceJsonLd(p: Pillar) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: p.name,
    serviceType: p.h1,
    description: p.intro,
    provider: { '@id': `${SITE_URL}/#org` },
    areaServed: ['LK', 'Worldwide'],
    offers: { '@type': 'Offer', priceCurrency: 'LKR', price: p.fromPriceLKR, description: 'Starting price' },
  }
}

export function productJsonLd(p: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: p.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS',
    description: p.pitch,
    offers: p.plans.flatMap((pl) => [
      { '@type': 'Offer', name: pl.name, price: pl.LKR, priceCurrency: 'LKR' },
      { '@type': 'Offer', name: pl.name, price: pl.USD, priceCurrency: 'USD' },
    ]),
  }
}

export function caseStudyJsonLd(c: CaseStudy) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${c.client}: ${c.result}`,
    about: c.industry,
    abstract: c.brief,
    datePublished: c.publishedAt,
    creator: { '@id': `${SITE_URL}/#org` },
    image: c.cover?.url,
  }
}
