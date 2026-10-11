import { getCaseStudies, getHome, getPillars, getProducts, getRateCard, getSettings, getTeam, getTestimonials } from '@/lib/cms'
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
import { toNet } from '@/network/toNet'
import { BeatNetwork } from '@/sections/home/BeatNetwork'

export default async function Home() {
  const [settings, pillars, cases, products, testimonials, team, rateCard, home] = await Promise.all([
    getSettings(), getPillars(), getCaseStudies(), getProducts(), getTestimonials(), getTeam(), getRateCard(), getHome(),
  ])
  const completed = cases.filter((c) => c.status !== 'in-progress')
  const building = cases.filter((c) => c.status === 'in-progress')
  const featured = completed.filter((c) => c.featured)
  const net = toNet(cases)
  return (
    <>
      <HashRedirect />
      {/* Phones and tablets: home screen of widgets + apps. Desktop: the 8 beats, unchanged. */}
      <HomeScreen settings={settings} products={products} cases={cases} copy={home.phoneHero} nowBuilding={home.nowBuilding} network={{ projects: net, universeAt: home.network.universeAt }} />
      <div className="hidden lg:block">
      <Beat1Hero settings={settings} hero={home.hero} />
      <Beat2Services pillars={pillars} copy={home.beats.services} />
      <Beat3StoreToSystem copy={home.beats.storeToSystem} steps={home.storeToSystem} />
      <Beat4Products products={products} copy={home.beats.products} />
      <Beat5Work cases={(featured.length ? featured : completed)} building={building} copy={home.beats.work} nowBuilding={home.nowBuilding} />
      <BeatNetwork copy={home.network} projects={net} universeAt={home.network.universeAt} />
      <Beat6Proof testimonials={testimonials} settings={settings} copy={home.beats.proof} />
      <Beat7Studio settings={settings} team={team} copy={home.beats.studio} />
      <Beat8Start rateCard={rateCard} settings={settings} copy={home.beats.start} />
      </div>
    </>
  )
}
