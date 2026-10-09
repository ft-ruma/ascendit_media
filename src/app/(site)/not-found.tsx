import Link from 'next/link'
import { PageWindow } from '@/sections/PageWindow'

export default function NotFound() {
  return (
    <PageWindow file="404.txt">
      <div className="grid justify-items-start gap-5 px-6 py-20 sm:px-10">
        <p className="eyebrow">Error 404</p>
        <h1 className="display text-[56px] text-ink sm:text-[80px]">This window is empty.</h1>
        <p className="text-[18px] text-ink/80">The page moved or never existed.</p>
        <Link href="/" className="btn-aqua h-12 px-7">Back to the desktop</Link>
      </div>
    </PageWindow>
  )
}
