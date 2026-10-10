'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import { formatMoney, useCurrency } from '@/lib/currency'
import { haptic } from '@/lib/haptics'
import { PILLAR_NAMES } from '@/lib/pillars'
import { cue } from '@/lib/sound'
import type { RateCard } from '@/lib/types'
import { usePhone } from '@/phone/store'
import { estimate, type Estimate } from './estimate'
import { TextField } from './fields'
import {
  BUDGETS, businessSchema, contactSchema, OPTIONS, PILLARS, type Pillar, scopeSchemas, STEPS, type Step, timelineSchema, budgetSchema,
  validateStep, whatSchema,
} from './schema'
import { type Draft, useBuilder } from './store'
import { submitBrief } from './submitBrief'
import { Turnstile } from './Turnstile'
import { usePartialLead } from './usePartialLead'

// Phone/tablet builder: one question per screen with big pill answers. Same
// store, schemas, estimate and /api/lead submission as the desktop builder.

type Opt = { id: string; label: string; hint?: string }
type Screen = {
  step: Step
  key: string
  legend: string
  hint?: string
  options?: readonly Opt[]
  multi?: 'what'
  get?: (d: Draft) => unknown
  set?: (d: Draft, v: string) => Partial<Draft>
  check: (d: Draft) => boolean
  field?: 'floorArea' | 'contact'
}

const PILLAR_HINTS: Record<Pillar, string> = {
  retail: 'Store interiors, renders, supervision',
  software: 'Custom systems and apps',
  web: 'Websites and online stores',
  brand: 'Identity and launch content',
}

const SCOPE_Q: Record<Pillar, { field: string; legend: string; options?: readonly Opt[] }[]> = {
  retail: [
    { field: 'floorArea', legend: 'How big is the store?' },
    { field: 'service', legend: 'Design only, or design and site supervision?', options: OPTIONS.retail.service },
    { field: 'renders', legend: 'Which renders do you need?', options: OPTIONS.retail.renders },
  ],
  web: [
    { field: 'type', legend: 'A website or an online store?', options: OPTIONS.web.type },
    { field: 'pages', legend: 'How many pages?', options: OPTIONS.web.pages },
    { field: 'storeSize', legend: 'How many products will you sell?', options: OPTIONS.web.storeSize },
  ],
  software: [
    { field: 'modules', legend: 'How many modules? (inventory, billing, HR, reports...)', options: OPTIONS.software.modules },
    { field: 'platform', legend: 'Web app, or web plus a mobile app?', options: OPTIONS.software.platform },
  ],
  brand: [
    { field: 'deliverable', legend: 'Identity, or identity plus launch content?', options: OPTIONS.brand.deliverable },
    { field: 'channels', legend: 'How many channels?', options: OPTIONS.brand.channels },
    { field: 'volume', legend: 'How much content each month?', options: OPTIONS.brand.volume },
  ],
}

function buildScreens(d: Draft, currency: 'LKR' | 'USD', rateCard: RateCard): Screen[] {
  const s: Screen[] = [
    {
      step: 'what', key: 'what', legend: 'What are we making together?', hint: 'Pick everything that applies.', multi: 'what',
      options: [
        ...PILLARS.map((p) => ({ id: `p:${p}`, label: PILLAR_NAMES[p], hint: PILLAR_HINTS[p] })),
        ...Object.entries(rateCard.products).map(([slug, p]) => ({ id: `r:${slug}`, label: p.name, hint: `${p.plan.name} plan, monthly` })),
      ],
      check: (x) => whatSchema.safeParse(x.what).success,
    },
    {
      step: 'business', key: 'industry', legend: 'What kind of business?', options: OPTIONS.industry.map((i) => ({ id: i, label: i })),
      get: (x) => x.business.industry, set: (x, v) => ({ business: { ...x.business, industry: v as never } }),
      check: (x) => businessSchema.shape.industry.safeParse(x.business.industry).success,
    },
    {
      step: 'business', key: 'size', legend: 'How big is the team?', options: OPTIONS.size,
      get: (x) => x.business.size, set: (x, v) => ({ business: { ...x.business, size: v as never } }),
      check: (x) => businessSchema.shape.size.safeParse(x.business.size).success,
    },
    {
      step: 'business', key: 'location', legend: 'Where are you based?', options: OPTIONS.location,
      get: (x) => x.business.location, set: (x, v) => ({ business: { ...x.business, location: v as never } }),
      check: (x) => businessSchema.shape.location.safeParse(x.business.location).success,
    },
  ]
  for (const p of d.what.pillars) {
    for (const q of SCOPE_Q[p]) {
      if (p === 'web' && q.field === 'storeSize' && d.scope.web?.type !== 'store') continue
      const shape = scopeSchemas[p].shape as Record<string, { safeParse: (v: unknown) => { success: boolean } }>
      s.push({
        step: 'scope', key: `${p}.${q.field}`, legend: q.legend, hint: PILLAR_NAMES[p], options: q.options,
        field: q.field === 'floorArea' ? 'floorArea' : undefined,
        get: (x) => x.scope[p]?.[q.field],
        set: (x, v) => ({ scope: { ...x.scope, [p]: { ...(x.scope[p] ?? {}), [q.field]: q.field === 'floorArea' ? (v === '' ? undefined : Number(v)) : v } } }),
        check: (x) => shape[q.field].safeParse(x.scope[p]?.[q.field]).success,
      })
    }
  }
  s.push(
    {
      step: 'timeline', key: 'timeline', legend: 'When do you want to start?', options: OPTIONS.timeline,
      get: (x) => x.timeline, set: (_x, v) => ({ timeline: v as never }), check: (x) => timelineSchema.safeParse(x.timeline).success,
    },
    {
      step: 'budget', key: 'budget', legend: 'What budget do you have in mind?', hint: `In ${currency}. Your estimate comes next.`, options: BUDGETS[currency],
      get: (x) => x.budget, set: (_x, v) => ({ budget: v }), check: (x) => budgetSchema.safeParse(x.budget).success,
    },
    {
      step: 'contact', key: 'contact', legend: 'Where should we send it?', field: 'contact',
      check: (x) => contactSchema.safeParse(x.contact).success,
    },
  )
  return s
}

export function SheetBuilder({ rateCard, onDone }: { rateCard: RateCard; onDone?: () => void }) {
  const { draft, step, status, reference, patch, setStep, setStatus, source } = useBuilder()
  const currency = useCurrency((s) => s.currency)
  const screens = useMemo(() => buildScreens(draft, currency, rateCard), [draft, currency, rateCard])
  const [i, setI] = useState(() => Math.max(0, screens.findIndex((x) => x.step === STEPS[step])))
  const [error, setError] = useState('')
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({})
  const [token, setToken] = useState<string | null>(null)
  const [sendError, setSendError] = useState('')
  const hp = useRef<HTMLInputElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const screen = screens[Math.min(i, screens.length - 1)]

  usePartialLead(screen.step === 'contact')

  // Keep the store's step (island "Brief n of 6", desktop builder) in sync.
  useEffect(() => {
    const n = STEPS.indexOf(screen.step)
    if (n !== step) setStep(n)
  }, [screen.step, step, setStep])

  useEffect(() => () => clearTimeout(advanceTimer.current), [])

  const est = useMemo(() => estimate({ what: draft.what, scope: draft.scope as never }, rateCard, currency), [draft.what, draft.scope, rateCard, currency])

  function go(n: number) {
    setError('')
    setI(Math.max(0, Math.min(screens.length - 1, n)))
    body.current?.scrollTo({ top: 0 })
    body.current?.focus()
  }

  function next() {
    if (!screen.check(draft)) {
      setError(screen.key === 'what' ? 'Pick at least one thing' : screen.field === 'floorArea' ? 'Enter the floor area (at least 50 sq ft)' : 'Please pick an answer')
      void cue('error')
      return
    }
    const following = screens[i + 1]
    if (following && following.step !== screen.step) {
      // Leaving a step: validate the whole step like the desktop builder does.
      if (!validateStep(screen.step, draft as never).success) return setError('Please answer each question')
      track('Builder step', { step: screen.step, source })
      if (following.step === 'contact') void cue('estimateReady')
    }
    haptic()
    void cue('builderStep')
    go(i + 1)
  }

  async function submit() {
    const r = contactSchema.safeParse(draft.contact)
    if (!r.success) {
      const errs: Record<string, string> = {}
      for (const issue of r.error.issues) errs[String(issue.path[0])] ??= issue.message
      setContactErrors(errs)
      void cue('error')
      return
    }
    setContactErrors({})
    setStatus('sending')
    setSendError('')
    try {
      const ref = await submitBrief({ draft, currency, source, token, honeypot: hp.current?.value ?? '' })
      setStatus('sent', ref)
      haptic()
      track('Brief sent', { source })
      void cue('briefSent')
      usePhone.getState().showFlash({ kind: 'sent', reference: ref })
    } catch (err) {
      setStatus('editing')
      setSendError(err instanceof Error ? err.message : 'Something went wrong')
      void cue('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="grid h-full content-start gap-5 overflow-y-auto px-6 pb-8 pt-4 text-center" aria-live="polite">
        <svg viewBox="0 0 64 64" className="check-pop mx-auto size-20" aria-hidden>
          <circle cx="32" cy="32" r="30" fill="var(--color-lime)" />
          <path className="check-draw" d="M19 33l9 9 17-19" fill="none" stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="text-[30px] font-medium tracking-tight text-ink">Brief sent</h2>
        <p className="text-[16px] text-ink/85">
          Reference <strong className="font-mono">{reference}</strong>. A copy is on its way to {draft.contact.email}. We reply within one working day, usually sooner on WhatsApp.
        </p>
        <WalletCard est={est} />
        <button type="button" className="btn-ghost mx-auto h-12 px-8" onClick={() => { useBuilder.getState().reset(); onDone?.() }}>
          Done
        </button>
      </div>
    )
  }

  const stepIndex = STEPS.indexOf(screen.step)
  const inStep = screens.filter((x) => x.step === screen.step)
  const sub = inStep.indexOf(screen)
  const value = screen.get?.(draft)

  return (
    <form
      className="flex h-full flex-col"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (screen.step === 'contact') void submit()
        else next()
      }}
    >
      <div className="shrink-0 px-6 pb-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[13px] text-graphite">
            Brief {stepIndex + 1} of {STEPS.length}
          </p>
          {inStep.length > 1 && <p className="font-mono text-[13px] text-graphite">{sub + 1}/{inStep.length}</p>}
        </div>
        <div className="mt-2 flex gap-1" role="progressbar" aria-label="Brief progress" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={stepIndex + 1}>
          {STEPS.map((s, n) => (
            <span key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
              <span className="block h-full rounded-full bg-aqua transition-all duration-300" style={{ width: n < stepIndex ? '100%' : n === stepIndex ? `${((sub + 1) / inStep.length) * 100}%` : '0%' }} />
            </span>
          ))}
        </div>
      </div>

      <div ref={body} tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-3 outline-none">
        <fieldset key={screen.key} className="min-w-0">
          <legend className="text-[26px] font-medium leading-[1.12] tracking-[-0.02em] text-ink">{screen.legend}</legend>
          {screen.hint && <p className="mt-1.5 font-mono text-[13px] text-graphite">{screen.hint}</p>}

          {screen.step === 'contact' && <div className="mt-4"><WalletCard est={est} /></div>}

          <div className="mt-5 grid gap-2.5">
            {screen.multi === 'what' &&
              screen.options!.map((o) => {
                const [kind, id] = o.id.split(':') as ['p' | 'r', string]
                const list = kind === 'p' ? draft.what.pillars : draft.what.products
                const on = (list as string[]).includes(id)
                return (
                  <Pill key={o.id} type="checkbox" name="what" checked={on} label={o.label} hint={o.hint}
                    onChange={() => {
                      haptic()
                      const nextList = on ? list.filter((x) => x !== id) : [...list, id]
                      patch('what', { ...draft.what, [kind === 'p' ? 'pillars' : 'products']: nextList } as never)
                    }}
                  />
                )
              })}

            {!screen.multi && screen.options &&
              screen.options.map((o) => (
                <Pill key={o.id} type="radio" name={screen.key} checked={value === o.id} label={o.label} hint={o.hint}
                  onChange={() => {
                    haptic()
                    const update = screen.set!(draft, o.id)
                    for (const [k, v] of Object.entries(update)) patch(k as keyof Draft, v as never)
                    setError('')
                    // Single answers move on by themselves after a beat.
                    clearTimeout(advanceTimer.current)
                    advanceTimer.current = setTimeout(() => document.getElementById('sheet-next')?.click(), 260)
                  }}
                />
              ))}

            {screen.field === 'floorArea' && (
              <TextField label="Floor area (sq ft)" name="floorArea" type="number" inputMode="numeric" placeholder="e.g. 1200"
                value={value as number} onChange={(v) => { const u = screen.set!(draft, v); patch('scope', u.scope as never) }} />
            )}

            {screen.field === 'contact' && (
              <div className="grid gap-3">
                <TextField label="Name" name="name" autoComplete="name" value={draft.contact.name} onChange={(v) => patch('contact', { ...draft.contact, name: v })} error={contactErrors.name} />
                <TextField label="Email" name="email" type="email" inputMode="email" autoComplete="email" value={draft.contact.email} onChange={(v) => patch('contact', { ...draft.contact, email: v })} error={contactErrors.email} />
                <TextField label="WhatsApp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+94 7X XXX XXXX" value={draft.contact.whatsapp} onChange={(v) => patch('contact', { ...draft.contact, whatsapp: v })} error={contactErrors.whatsapp} />
                <TextField label="Company (optional)" name="company" autoComplete="organization" value={draft.contact.company} onChange={(v) => patch('contact', { ...draft.contact, company: v })} />
                <fieldset>
                  <legend className="mb-2 text-[14px] font-medium text-ink">Best time to reach you</legend>
                  <div className="flex flex-wrap gap-2">
                    {(['morning', 'afternoon', 'evening', 'any'] as const).map((t) => (
                      <label key={t} className={`flex min-h-11 cursor-pointer items-center rounded-pill border px-4 text-[15px] ${draft.contact.bestTime === t ? 'border-aqua-deep bg-aqua-deep text-white' : 'border-hairline text-ink'}`}>
                        <input type="radio" name="bestTime" className="sr-only" checked={draft.contact.bestTime === t} onChange={() => patch('contact', { ...draft.contact, bestTime: t })} />
                        {t === 'any' ? 'Any time' : t[0].toUpperCase() + t.slice(1)}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
                  <label>Website<input ref={hp} name="website" tabIndex={-1} autoComplete="off" /></label>
                </div>
                <Turnstile onToken={setToken} />
              </div>
            )}
          </div>
          <p role="alert" className="mt-3 min-h-5 text-[14px] font-medium text-error">{error || sendError}</p>
        </fieldset>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-hairline px-6 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
        {i > 0 && (
          <button type="button" className="btn-ghost h-12 px-5" onClick={() => go(i - 1)}>
            Back
          </button>
        )}
        <button id="sheet-next" type="submit" className="btn-aqua ml-auto h-12 flex-1 text-[16px]" disabled={status === 'sending'}>
          {screen.step === 'contact' ? (status === 'sending' ? 'Sending...' : 'Send brief') : 'Next'}
        </button>
      </div>
    </form>
  )
}

function Pill({ type, name, checked, label, hint, onChange }: { type: 'radio' | 'checkbox'; name: string; checked: boolean; label: string; hint?: string; onChange: () => void }) {
  return (
    <label
      className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[26px] border px-5 py-2.5 transition active:scale-[.98] ${
        checked ? 'border-aqua-deep bg-aqua-deep text-white shadow-[0_8px_18px_-10px_rgb(31_95_224/.8)]' : 'border-hairline bg-window text-ink'
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span aria-hidden className={`grid size-5 shrink-0 place-items-center rounded-full border ${checked ? 'border-white bg-white' : 'border-ink/25'}`}>
        {checked && <span className="size-2.5 rounded-full bg-aqua-deep" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] font-medium leading-tight">{label}</span>
        {hint && <span className={`block text-[13px] ${checked ? 'text-white/85' : 'text-graphite'}`}>{hint}</span>}
      </span>
    </label>
  )
}

/** The live estimate as a wallet-style card, in our palette. */
export function WalletCard({ est }: { est: Estimate }) {
  return (
    <div className="wallet-in relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#1F5FE0_0%,#3F49D2_55%,#5A45C8_100%)] p-5 text-left text-white shadow-[0_18px_40px_-18px_rgb(31_95_224/.8)]" aria-live="polite">
      <span aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-20 -right-6 size-36 rounded-full bg-lilac/30" />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[12px] uppercase tracking-wider text-white/85">estimate.calc</span>
        <span className="font-mono text-[12px] text-white/85">{est.cur}</span>
      </div>
      {est.high > 0 && (
        <p className="relative mt-5 text-[26px] font-medium leading-tight tracking-tight tabular-nums">
          {formatMoney(est.low, est.cur)}
          <span className="text-white/70"> – </span>
          {formatMoney(est.high, est.cur)}
        </p>
      )}
      {est.products.map((p) => (
        <p key={p.slug} className="relative mt-3 flex items-start justify-between gap-3 border-t border-white/20 pt-3 text-[14px]">
          <span className="font-medium">{p.name}</span>
          <span className="text-right tabular-nums">
            {formatMoney(p.monthly, est.cur)}/mo
            <span className="block text-[12px] text-white/85">+ {formatMoney(p.setup, est.cur)} setup</span>
          </span>
        </p>
      ))}
      <div className="relative mt-4 flex items-center justify-between gap-3">
        {est.saving > 0 ? (
          <span className="rounded-pill bg-lime px-2.5 py-0.5 text-[13px] font-medium text-ink">{Math.round(est.saving * 100)}% bundle saving</span>
        ) : (
          <span />
        )}
        <span className="text-[12px] text-white/85">Indicative, not a quote</span>
      </div>
    </div>
  )
}
