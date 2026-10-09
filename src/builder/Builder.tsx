'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import { formatMoney, useCurrency } from '@/lib/currency'
import { PILLAR_NAMES } from '@/lib/pillars'
import { cue } from '@/lib/sound'
import type { RateCard } from '@/lib/types'
import { estimate } from './estimate'
import { Choices, Question, SubQuestion, TextField } from './fields'
import { BUDGETS, contactSchema, OPTIONS, PILLARS, type Pillar, STEPS, validateStep } from './schema'
import { useBuilder } from './store'
import { Turnstile } from './Turnstile'
import { usePartialLead } from './usePartialLead'

type Props = {
  rateCard: RateCard
  /** inline: only step 1, then hands over to the modal (home beat 8). */
  variant?: 'modal' | 'page' | 'inline'
  onDone?: () => void
}

const STEP_LABELS = ['What', 'Business', 'Scope', 'Timeline', 'Budget', 'Contact']

const PILLAR_HINTS: Record<Pillar, string> = {
  retail: 'Store interiors, renders, supervision',
  software: 'Custom systems and apps',
  web: 'Websites and online stores',
  brand: 'Identity and launch content',
}

export function Builder({ rateCard, variant = 'page', onDone }: Props) {
  const { draft, step, status, reference, patch, setStep, setStatus, openModal, source } = useBuilder()
  const currency = useCurrency((s) => s.currency)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [token, setToken] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const hp = useRef<HTMLInputElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const name = variant === 'inline' ? 'what' : STEPS[step]

  useEffect(() => {
    void useBuilder.persist.rehydrate()
  }, [])

  usePartialLead(variant !== 'inline' && name === 'contact')

  // Products have no scope sub-form; skip the step when only products were picked.
  const scopeNeeded = draft.what.pillars.length > 0
  const est = useMemo(
    () => estimate({ what: draft.what, scope: draft.scope as never }, rateCard, currency),
    [draft.what, draft.scope, rateCard, currency],
  )
  const showEstimate = step >= STEPS.indexOf('contact') || status === 'sent'

  const productOptions = Object.entries(rateCard.products).map(([slug, p]) => ({
    id: slug,
    label: p.name,
    hint: `${p.plan.name} plan, monthly`,
  }))

  function collectErrors(): Record<string, string> {
    const r = validateStep(name, draft as never)
    if (r.success) return {}
    const out: Record<string, string> = {}
    for (const issue of r.error.issues) {
      const key = issue.path.join('.') || '_'
      out[key] ??= issue.message.startsWith('Invalid') || issue.message.startsWith('Expected') ? 'Please answer this' : issue.message
    }
    return out
  }

  function next() {
    const errs = collectErrors()
    setErrors(errs)
    if (Object.keys(errs).length) {
      void cue('error')
      return
    }
    track('Builder step', { step: name, source })
    void cue('builderStep')
    if (variant === 'inline') {
      openModal({ source: 'home-inline', step: 1 })
      return
    }
    let n = step + 1
    if (STEPS[n] === 'scope' && !scopeNeeded) n++
    if (STEPS[n] === 'contact') void cue('estimateReady')
    setStep(n)
    panel.current?.focus()
  }

  function back() {
    let n = step - 1
    if (STEPS[n] === 'scope' && !scopeNeeded) n--
    setErrors({})
    setStep(n)
    panel.current?.focus()
  }

  async function submit() {
    const errs = collectErrors()
    setErrors(errs)
    if (Object.keys(errs).length) return void cue('error')
    setStatus('sending')
    setSendError(null)
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'builder',
          status: 'complete',
          answers: { what: draft.what, business: draft.business, scope: draft.scope, timeline: draft.timeline, budget: draft.budget },
          contact: contactSchema.parse(draft.contact),
          currency,
          source,
          page: location.pathname,
          turnstileToken: token,
          website: hp.current?.value ?? '',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Something went wrong')
      setStatus('sent', data.reference)
      track('Brief sent', { source })
      void cue('briefSent')
    } catch (err) {
      setStatus('editing')
      setSendError(err instanceof Error ? err.message : 'Something went wrong')
      void cue('error')
    }
  }

  if (status === 'sent' && variant !== 'inline') {
    return (
      <div className="grid gap-6 p-6 sm:p-8" aria-live="polite">
        <p className="font-mono text-[13px] text-graphite">brief-sent.txt</p>
        <h2 className="font-serif text-[40px] italic leading-none text-ink">Brief sent.</h2>
        <p className="max-w-prose text-[17px] text-ink">
          Thanks{draft.contact.name ? `, ${draft.contact.name.split(' ')[0]}` : ''}. Your reference is{' '}
          <strong className="font-mono">{reference}</strong>. A copy of your brief and estimate is on its way to {draft.contact.email}, and we
          reply within one working day (usually much sooner on WhatsApp).
        </p>
        <EstimateCard est={est} />
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-ghost" onClick={() => { useBuilder.getState().reset(); onDone?.() }}>
            Close
          </button>
        </div>
      </div>
    )
  }

  const pillars = draft.what.pillars
  const scope = draft.scope
  const setScope = (p: Pillar, k: string, v: unknown) => patch('scope', { ...scope, [p]: { ...(scope[p] ?? {}), [k]: v } })
  const err = (k: string) => errors[k]

  return (
    <div className={variant === 'inline' ? '' : 'grid min-h-0 lg:grid-cols-[1fr_300px]'}>
      <form
        className="flex min-h-0 flex-col"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (name === 'contact') void submit()
          else next()
        }}
      >
        {variant !== 'inline' && (
          <ol className="flex gap-1 px-6 pt-5 sm:px-8" aria-label="Progress">
            {STEP_LABELS.map((l, i) => (
              <li key={l} className="flex-1">
                <span className={`block h-1 rounded-full ${i <= step ? 'bg-aqua' : 'bg-hairline'}`} />
                <span className={`mt-1.5 hidden font-mono text-[11px] sm:block ${i === step ? 'text-ink' : 'text-graphite'}`} aria-current={i === step ? 'step' : undefined}>
                  {l}
                </span>
              </li>
            ))}
          </ol>
        )}

        <div ref={panel} tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto px-6 py-6 outline-none sm:px-8">
          <div aria-live="polite" className="sr-only">
            {Object.values(errors)[0] ?? ''}
          </div>

          {name === 'what' && (
            <Question legend="What are we making together?" hint="Pick everything that applies. Services and products can be combined." error={err('pillars')}>
              <p className="mb-2 font-mono text-[12px] uppercase tracking-wider text-graphite">Services</p>
              <Choices
                name="pillars"
                multiple
                options={PILLARS.map((p) => ({ id: p, label: PILLAR_NAMES[p], hint: PILLAR_HINTS[p] }))}
                value={draft.what.pillars}
                onChange={(v) => patch('what', { ...draft.what, pillars: v as Pillar[] })}
              />
              <p className="mb-2 mt-5 font-mono text-[12px] uppercase tracking-wider text-graphite">Products</p>
              <Choices
                name="products"
                multiple
                columns={3}
                options={productOptions}
                value={draft.what.products}
                onChange={(v) => patch('what', { ...draft.what, products: v as never })}
              />
            </Question>
          )}

          {name === 'business' && (
            <Question legend="Tell us about the business">
              <div className="grid gap-5">
                <SubQuestion legend="Industry">
                  <Choices name="industry" columns={2} options={OPTIONS.industry.map((i) => ({ id: i, label: i }))} value={draft.business.industry} onChange={(v) => patch('business', { ...draft.business, industry: v as never })} />
                  {err('industry') && <p className="mt-1 text-[13px] font-medium text-error">{err('industry')}</p>}
                </SubQuestion>
                <SubQuestion legend="Team size">
                  <Choices name="size" columns={3} options={OPTIONS.size} value={draft.business.size} onChange={(v) => patch('business', { ...draft.business, size: v as never })} />
                  {err('size') && <p className="mt-1 text-[13px] font-medium text-error">{err('size')}</p>}
                </SubQuestion>
                <SubQuestion legend="Where are you based?">
                  <Choices name="location" options={OPTIONS.location} value={draft.business.location} onChange={(v) => patch('business', { ...draft.business, location: v as never })} />
                  {err('location') && <p className="mt-1 text-[13px] font-medium text-error">{err('location')}</p>}
                </SubQuestion>
                <label className="flex items-center gap-3 text-[15px] text-ink">
                  <input type="checkbox" className="size-4 accent-[var(--color-aqua-deep)]" checked={!!draft.business.registered} onChange={(e) => patch('business', { ...draft.business, registered: e.target.checked })} />
                  We are a registered company
                </label>
              </div>
            </Question>
          )}

          {name === 'scope' && (
            <Question legend="A little more detail" hint="So the estimate is close to what you will actually pay.">
              <div className="grid gap-8">
                {pillars.includes('retail') && (
                  <ScopeGroup title="Retail design">
                    <TextField label="Floor area (sq ft)" name="floorArea" type="number" inputMode="numeric" value={scope.retail?.floorArea as number} onChange={(v) => setScope('retail', 'floorArea', v === '' ? undefined : Number(v))} error={err('retail.floorArea')} placeholder="e.g. 1200" />
                    <SubQuestion legend="Service"><Choices name="retail-service" options={OPTIONS.retail.service} value={scope.retail?.service as string} onChange={(v) => setScope('retail', 'service', v)} /></SubQuestion>
                    <SubQuestion legend="Renders"><Choices name="retail-renders" options={OPTIONS.retail.renders} value={scope.retail?.renders as string} onChange={(v) => setScope('retail', 'renders', v)} /></SubQuestion>
                    <GroupError errors={errors} prefix="retail" skip={['retail.floorArea']} />
                  </ScopeGroup>
                )}
                {pillars.includes('web') && (
                  <ScopeGroup title="Web">
                    <SubQuestion legend="What kind of site?"><Choices name="web-type" options={OPTIONS.web.type} value={scope.web?.type as string} onChange={(v) => setScope('web', 'type', v)} /></SubQuestion>
                    <SubQuestion legend="How many pages?"><Choices name="web-pages" columns={3} options={OPTIONS.web.pages} value={scope.web?.pages as string} onChange={(v) => setScope('web', 'pages', v)} /></SubQuestion>
                    {scope.web?.type === 'store' && (
                      <SubQuestion legend="Store size"><Choices name="web-store" columns={3} options={OPTIONS.web.storeSize} value={scope.web?.storeSize as string} onChange={(v) => setScope('web', 'storeSize', v)} /></SubQuestion>
                    )}
                    <GroupError errors={errors} prefix="web" />
                  </ScopeGroup>
                )}
                {pillars.includes('software') && (
                  <ScopeGroup title="Software">
                    <SubQuestion legend="How many modules? (inventory, billing, HR, reports...)"><Choices name="sw-modules" columns={3} options={OPTIONS.software.modules} value={scope.software?.modules as string} onChange={(v) => setScope('software', 'modules', v)} /></SubQuestion>
                    <SubQuestion legend="Platform"><Choices name="sw-platform" options={OPTIONS.software.platform} value={scope.software?.platform as string} onChange={(v) => setScope('software', 'platform', v)} /></SubQuestion>
                    <GroupError errors={errors} prefix="software" />
                  </ScopeGroup>
                )}
                {pillars.includes('brand') && (
                  <ScopeGroup title="Brand & content">
                    <SubQuestion legend="Deliverable"><Choices name="br-deliverable" options={OPTIONS.brand.deliverable} value={scope.brand?.deliverable as string} onChange={(v) => setScope('brand', 'deliverable', v)} /></SubQuestion>
                    <SubQuestion legend="Channels"><Choices name="br-channels" columns={3} options={OPTIONS.brand.channels} value={scope.brand?.channels as string} onChange={(v) => setScope('brand', 'channels', v)} /></SubQuestion>
                    <SubQuestion legend="Monthly content volume"><Choices name="br-volume" options={OPTIONS.brand.volume} value={scope.brand?.volume as string} onChange={(v) => setScope('brand', 'volume', v)} /></SubQuestion>
                    <GroupError errors={errors} prefix="brand" />
                  </ScopeGroup>
                )}
              </div>
            </Question>
          )}

          {name === 'timeline' && (
            <Question legend="When do you want to start?" error={err('_')}>
              <Choices name="timeline" columns={3} options={OPTIONS.timeline} value={draft.timeline} onChange={(v) => patch('timeline', v as never)} />
            </Question>
          )}

          {name === 'budget' && (
            <Question legend="What budget do you have in mind?" hint={`In ${currency}. Your estimate appears on the next step.`} error={err('_')}>
              <Choices name="budget" columns={1} options={BUDGETS[currency]} value={draft.budget} onChange={(v) => patch('budget', v as string)} />
            </Question>
          )}

          {name === 'contact' && (
            <Question legend="Where should we send it?" hint="We reply within one working day.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Name" name="name" autoComplete="name" value={draft.contact.name} onChange={(v) => patch('contact', { ...draft.contact, name: v })} error={err('name')} />
                <TextField label="Company (optional)" name="company" autoComplete="organization" value={draft.contact.company} onChange={(v) => patch('contact', { ...draft.contact, company: v })} />
                <TextField label="Email" name="email" type="email" inputMode="email" autoComplete="email" value={draft.contact.email} onChange={(v) => patch('contact', { ...draft.contact, email: v })} error={err('email')} />
                <TextField label="WhatsApp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+94 7X XXX XXXX" value={draft.contact.whatsapp} onChange={(v) => patch('contact', { ...draft.contact, whatsapp: v })} error={err('whatsapp')} />
              </div>
              <div className="mt-5">
                <SubQuestion legend="Best time to reach you">
                  <Choices
                    name="bestTime"
                    columns={2}
                    options={[{ id: 'morning', label: 'Morning' }, { id: 'afternoon', label: 'Afternoon' }, { id: 'evening', label: 'Evening' }, { id: 'any', label: 'Any time' }]}
                    value={draft.contact.bestTime}
                    onChange={(v) => patch('contact', { ...draft.contact, bestTime: v as never })}
                  />
                </SubQuestion>
              </div>
              {/* Honeypot: hidden from people, irresistible to bots. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
                <label>Website<input ref={hp} name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>
              <Turnstile onToken={setToken} />
              <div className="mt-6 lg:hidden"><EstimateCard est={est} /></div>
              {sendError && <p role="alert" className="mt-4 text-[14px] font-medium text-error">{sendError}. Please try again or WhatsApp us.</p>}
            </Question>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-hairline px-6 py-4 sm:px-8">
          {step > 0 && variant !== 'inline' && (
            <button type="button" className="btn-ghost" onClick={back}>
              Back
            </button>
          )}
          <span className="font-mono text-[13px] text-graphite">
            {variant === 'inline' ? 'Step 1 of 6' : `${step + 1} / ${STEPS.length}`}
          </span>
          <button type="submit" className="btn-aqua ml-auto h-11 px-6 text-[15px]" disabled={status === 'sending'}>
            {name === 'contact' ? (status === 'sending' ? 'Sending...' : 'Send brief') : 'Next'}
          </button>
        </div>
      </form>

      {variant !== 'inline' && (
        <aside className="hidden border-l border-hairline bg-paper/60 p-6 lg:block" aria-label="Your estimate">
          {showEstimate ? (
            <EstimateCard est={est} />
          ) : (
            <div className="grid gap-3">
              <p className="font-mono text-[13px] text-graphite">estimate.calc</p>
              <p className="text-[15px] text-ink">Answer a few questions and your estimate appears after the budget step, in {currency}.</p>
              <ul className="mt-2 grid gap-1.5 text-[14px] text-ink">
                {draft.what.pillars.map((p) => <li key={p}>• {PILLAR_NAMES[p]}</li>)}
                {draft.what.products.map((p) => <li key={p}>• {rateCard.products[p]?.name}</li>)}
              </ul>
            </div>
          )}
        </aside>
      )}
    </div>
  )
}

function ScopeGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-2xl border border-hairline bg-paper/50 p-4 sm:p-5">
      <h3 className="font-mono text-[13px] uppercase tracking-wider text-ink">{title}</h3>
      {children}
    </section>
  )
}

function GroupError({ errors, prefix, skip = [] }: { errors: Record<string, string>; prefix: string; skip?: string[] }) {
  const has = Object.keys(errors).some((k) => k.startsWith(prefix) && !skip.includes(k))
  return has ? <p className="text-[13px] font-medium text-error">Please answer each question above.</p> : null
}

export function EstimateCard({ est }: { est: ReturnType<typeof estimate> }) {
  const hasProject = est.high > 0
  return (
    <div className="grid gap-3 rounded-2xl border border-hairline bg-window p-5 shadow-window" aria-live="polite">
      <p className="font-mono text-[13px] text-graphite">estimate.calc</p>
      {hasProject && (
        <div>
          <p className="text-[13px] text-graphite">Project estimate</p>
          <p className="text-[26px] font-semibold tracking-tight text-ink tabular-nums">
            {formatMoney(est.low, est.cur)}
            <span className="text-graphite"> – </span>
            {formatMoney(est.high, est.cur)}
          </p>
          {est.saving > 0 && (
            <p className="mt-1 inline-flex rounded-pill bg-lime px-2.5 py-0.5 text-[13px] font-medium text-ink">
              Includes {Math.round(est.saving * 100)}% bundle saving
            </p>
          )}
        </div>
      )}
      {est.products.length > 0 && (
        <div className="grid gap-1.5 border-t border-hairline pt-3">
          {est.products.map((p) => (
            <p key={p.slug} className="flex justify-between gap-3 text-[14px] text-ink">
              <span>{p.name} <span className="text-graphite">({p.plan})</span></span>
              <span className="text-right tabular-nums">
                {formatMoney(p.monthly, est.cur)}/mo
                <span className="block text-[13px] text-graphite">+ {formatMoney(p.setup, est.cur)} setup</span>
              </span>
            </p>
          ))}
        </div>
      )}
      <p className="text-[13px] text-graphite">Indicative only. A written quote follows a short discovery call.</p>
    </div>
  )
}
