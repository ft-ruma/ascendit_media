import { getSettings } from '@/lib/cms'
import { pageMeta } from '@/lib/seo'
import { TypedNote } from '@/phone/TypedNote'
import { PageWindow } from '@/sections/PageWindow'

export const metadata = {
  ...pageMeta({ title: 'A note from the founder', description: 'Why Ascendit exists: one studio for the store, the system and the launch.', path: '/notes' }),
  robots: { index: false, follow: true }, // the same letter is on /studio
}

export default async function NotesPage() {
  const s = await getSettings()
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <PageWindow file="founder-letter.txt">
      <article>
        <header className="grid gap-2 px-6 pb-4 pt-10 sm:px-10">
          <p className="eyebrow">Notes · {date}</p>
          <h1 className="display text-[46px] text-ink sm:text-[64px]">A note from the founder</h1>
        </header>
        <div className="bg-[repeating-linear-gradient(to_bottom,transparent_0_31px,var(--color-hairline)_31px_32px)] px-6 pb-12 pt-2 sm:px-10">
          <TypedNote text={s.founderNote.quote} />
          <p className="mt-6 font-serif text-[26px] italic text-ink">{s.founderNote.name}</p>
          <p className="text-[15px] text-graphite">{s.founderNote.role}</p>
        </div>
      </article>
    </PageWindow>
  )
}
