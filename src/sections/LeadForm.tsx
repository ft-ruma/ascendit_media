'use client'
import { useRef, useState } from 'react'
import { TextField } from '@/builder/fields'
import { Turnstile } from '@/builder/Turnstile'
import { track } from '@/lib/analytics'
import { useCurrency } from '@/lib/currency'
import { cue } from '@/lib/sound'

type Field = { name: string; label: string; type?: 'text' | 'email' | 'tel' | 'url' | 'textarea'; autoComplete?: string; optional?: boolean }

const BASE: Field[] = [
  { name: 'name', label: 'Name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'whatsapp', label: 'WhatsApp / phone', type: 'tel', autoComplete: 'tel' },
]

/** Contact, demo and career forms: same /api/lead route, different type. */
export function LeadForm({
  type, extra = {}, fields = [], submitLabel = 'Send', successTitle = 'Sent.',
}: {
  type: 'contact' | 'demo' | 'career'
  extra?: Record<string, string>
  fields?: Field[]
  submitLabel?: string
  successTitle?: string
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [reference, setReference] = useState('')
  const [formError, setFormError] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const hp = useRef<HTMLInputElement>(null)
  const currency = useCurrency((s) => s.currency)
  const all = [...BASE, ...fields]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setFormError('')
    const contact: Record<string, string> = { bestTime: 'any' }
    for (const f of all) if (values[f.name]) contact[f.name] = values[f.name]
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, status: 'complete', ...extra, contact, currency, page: location.pathname, turnstileToken: token, website: hp.current?.value ?? '' }),
    }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}
    if (res?.ok && data.ok) {
      setReference(data.reference)
      setState('sent')
      track(`${type} sent`)
      void cue('briefSent')
      return
    }
    const fe: Record<string, string> = {}
    for (const f of (data.fields ?? []) as { path: string; message: string }[]) fe[f.path.replace(/^contact\./, '')] ??= f.message
    setErrors(fe)
    setFormError(data.error ?? 'Could not send. Please try WhatsApp instead.')
    setState('idle')
    void cue('error')
  }

  if (state === 'sent') {
    return (
      <div aria-live="polite" className="grid gap-3 rounded-2xl border border-hairline bg-paper p-6">
        <p className="display text-[34px] text-ink">{successTitle}</p>
        <p className="text-[16px] text-ink">Reference <strong className="font-mono">{reference}</strong>. We reply within one working day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {all.map((f) =>
          f.type === 'textarea' ? (
            <div key={f.name} className="sm:col-span-2">
              <label htmlFor={`f-${f.name}`} className="mb-1.5 block text-[14px] font-medium text-ink">{f.label}</label>
              <textarea
                id={`f-${f.name}`}
                rows={5}
                value={values[f.name] ?? ''}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                aria-invalid={!!errors[f.name]}
                className="w-full rounded-xl border border-hairline bg-window p-3.5 text-[16px] text-ink aria-[invalid=true]:border-error"
              />
              {errors[f.name] && <p className="mt-1 text-[13px] font-medium text-error">{errors[f.name]}</p>}
            </div>
          ) : (
            <TextField
              key={f.name}
              name={f.name}
              label={f.label + (f.optional ? ' (optional)' : '')}
              type={f.type ?? 'text'}
              autoComplete={f.autoComplete}
              value={values[f.name]}
              onChange={(v) => setValues({ ...values, [f.name]: v })}
              error={errors[f.name]}
            />
          ),
        )}
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>Website<input ref={hp} name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <Turnstile onToken={setToken} />
      <p aria-live="polite" className="text-[14px] font-medium text-error">{formError}</p>
      <div>
        <button type="submit" className="btn-aqua h-11 px-6" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
