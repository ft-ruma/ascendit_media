import { getCaseStudies, getPillars, getProducts, getRateCard, getSettings, getTeam, getTestimonials } from '@/lib/cms'
import { Beat1Hero } from '@/sections/home/Beat1Hero'
import { Beat2Services } from '@/sections/home/Beat2Services'
import { Beat3StoreToSystem } from '@/sections/home/Beat3StoreToSystem'
import { Beat4Products } from '@/sections/home/Beat4Products'
import { Beat5Work } from '@/sections/home/Beat5Work'
import { Beat6Proof } from '@/sections/home/Beat6Proof'
import { Beat7Studio } from '@/sections/home/Beat7Studio'
import { Beat8Start } from '@/sections/home/Beat8Start'
import { HashRedirect } from '@/sections/home/HashRedirect'
import { HomeScreen } from '@/phone/HomeScreen'

export default async function Home() {
  const [settings, pillars, cases, products, testimonials, team, rateCard] = await Promise.all([
    getSettings(), getPillars(), getCaseStudies(), getProducts(), getTestimonials(), getTeam(), getRateCard(),
  ])
  const featured = cases.filter((c) => c.featured)
  return (
    <>
      <HashRedirect />
      {/* Phones and tablets: home screen of widgets + apps. Desktop: the 8 beats, unchanged. */}
      <HomeScreen settings={settings} products={products} cases={cases} />
      <div className="hidden lg:block">
      <Beat1Hero settings={settings} />
      <Beat2Services pillars={pillars} />
      <Beat3StoreToSystem />
      <Beat4Products products={products} />
      <Beat5Work cases={featured.length ? featured : cases} />
      <Beat6Proof testimonials={testimonials} settings={settings} />
      <Beat7Studio settings={settings} team={team} />
      <Beat8Start rateCard={rateCard} settings={settings} />
      </div>
    </>
  )
}
