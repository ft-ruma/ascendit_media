import type { ReactNode } from 'react'

export function BeatHeader({ n, eyebrow, title, children, id }: { n: number; eyebrow: string; title: ReactNode; children?: ReactNode; id: string }) {
  return (
    <div className="mb-8 grid gap-3 lg:mb-10 lg:max-w-[60%]">
      <p className="eyebrow">
        <span className="tabular-nums">0{n}</span> · {eyebrow}
      </p>
      <h2 id={id} className="display text-[44px] text-ink sm:text-[56px] lg:text-[72px]">
        {title}
      </h2>
      {children && <div className="max-w-[58ch] text-[17px] text-ink/85">{children}</div>}
    </div>
  )
}
