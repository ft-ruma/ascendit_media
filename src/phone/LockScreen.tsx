import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from '@/os/wordmark-paths'
import { LockController } from './LockController'

type Note = { app: string; title: string; body: string; tone: string }

/**
 * Phone/tablet lock screen, once per session. Server HTML so it paints with the
 * first frame (it never delays first content paint); hidden unless the head
 * script set <html data-lock>. CSS also fades it out after ~2.6 s if JS never runs.
 */
export function LockScreen({ notes }: { notes: Note[] }) {
  return (
    <div className="lockscreen fixed inset-0 z-[95] hidden flex-col items-center bg-paper px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-[calc(env(safe-area-inset-top)+56px)] text-ink">
      <div aria-hidden className="flex w-full max-w-[420px] flex-col items-center">
        <svg viewBox={WORDMARK_VIEWBOX} className="h-6 w-auto">
          {Object.values(WORDMARK_PATHS).map((d, i) => <path key={i} d={d} fill="#0E0E12" fillRule="evenodd" />)}
        </svg>
        <p id="lock-date" className="mt-6 text-[17px] font-medium text-ink/80" suppressHydrationWarning>
          {'\u00a0'}
        </p>
        <p id="lock-time" className="font-sans text-[88px] font-medium leading-none tracking-[-0.04em] tabular-nums" suppressHydrationWarning>
          {/* placeholder text node: the inline script swaps in the live time before paint */}
          {'\u00a0'}
        </p>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=new Date(),z='Asia/Colombo';document.getElementById('lock-time').textContent=new Intl.DateTimeFormat('en-LK',{timeZone:z,hour:'2-digit',minute:'2-digit',hour12:false}).format(n);document.getElementById('lock-date').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:z,weekday:'long',day:'numeric',month:'long'}).format(n)}catch(e){}})()`,
          }}
        />
        <ul className="mt-10 grid w-full gap-2">
          {notes.map((n, i) => (
            <li
              key={n.title}
              className="lock-note flex items-start gap-3 rounded-[22px] border border-white/70 bg-window/80 p-3.5 shadow-window backdrop-blur-xl"
              style={{ animationDelay: `${0.15 + i * 0.12}s` }}
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-[10px] border border-ink/10 font-mono text-[10px] font-semibold ${n.tone}`}>{n.app}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[15px] font-semibold">{n.title}</span>
                  <span className="shrink-0 text-[13px] text-graphite">now</span>
                </span>
                <span className="block text-[14px] leading-snug text-ink/80">{n.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto flex flex-col items-center gap-3">
        <button type="button" data-unlock className="flex min-h-11 items-center px-6 font-mono text-[14px] text-ink/70">
          Swipe up to open
        </button>
        <span aria-hidden className="h-[5px] w-32 rounded-full bg-ink" />
      </div>
      <LockController />
    </div>
  )
}
