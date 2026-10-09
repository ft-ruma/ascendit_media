import { getRateCard } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { PageWindow } from '@/sections/PageWindow'
import { StartBuilder } from './StartBuilder'

export const metadata = pageMeta({
  title: 'Start a project: get an estimate in two minutes',
  description: 'Tell us what you need and get a live estimate in LKR or USD for retail design, software, web or branding.',
  path: '/start',
})

/** Same builder as the modal, with its own URL for ads and sharing. ?pillar= / ?product= pre-fill it. */
export default async function StartPage() {
  const rateCard = await getRateCard()
  return (
    <PageWindow file="new-project.brief">
      <h1 className="sr-only">Start a project</h1>
      <StartBuilder rateCard={rateCard} />
    </PageWindow>
  )
}
