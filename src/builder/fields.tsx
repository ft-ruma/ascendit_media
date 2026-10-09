'use client'
import type { ReactNode } from 'react'

type Opt = { id: string; label: string; hint?: string }

export function Question({ legend, hint, children, error }: { legend: string; hint?: string; children: ReactNode; error?: string }) {
  return (
    <fieldset className="min-w-0">
      <legend className="font-serif text-[30px] italic leading-[1.05] text-ink sm:text-[36px]">{legend}</legend>
      {hint && <p className="mt-2 text-[15px] text-graphite">{hint}</p>}
      <div className="mt-5">{children}</div>
      {error && (
        <p className="mt-3 text-[14px] font-medium text-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export function SubQuestion({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-[14px] font-medium text-ink">{legend}</legend>
      {children}
    </fieldset>
  )
}

export function Choices({
  name, options, value, onChange, multiple = false, columns = 2,
}: {
  name: string
  options: readonly Opt[]
  value: string | string[] | undefined
  onChange: (v: string | string[]) => void
  multiple?: boolean
  columns?: 1 | 2 | 3
}) {
  const selected = (id: string) => (Array.isArray(value) ? value.includes(id) : value === id)
  const cols = columns === 1 ? '' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  return (
    <div className={`grid gap-2 ${cols}`}>
      {options.map((o) => (
        <label
          key={o.id}
          className={`choice group relative flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
            selected(o.id) ? 'border-aqua bg-aqua/8 shadow-[0_0_0_1px_var(--color-aqua)]' : 'border-hairline bg-window hover:border-ink/25'
          }`}
        >
          <input
            type={multiple ? 'checkbox' : 'radio'}
            name={name}
            value={o.id}
            checked={selected(o.id)}
            onChange={(e) => {
              if (!multiple) return onChange(o.id)
              const cur = Array.isArray(value) ? value : []
              onChange(e.target.checked ? [...cur, o.id] : cur.filter((x) => x !== o.id))
            }}
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-aqua-deep)]"
          />
          <span className="min-w-0">
            <span className="block text-[15px] font-medium text-ink">{o.label}</span>
            {o.hint && <span className="mt-0.5 block text-[13px] text-graphite">{o.hint}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

export function TextField({
  label, name, value, onChange, type = 'text', error, autoComplete, inputMode, placeholder,
}: {
  label: string
  name: string
  value: string | number | undefined
  onChange: (v: string) => void
  type?: string
  error?: string
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'tel' | 'numeric'
  placeholder?: string
}) {
  const id = `f-${name}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className="h-11 w-full rounded-xl border border-hairline bg-window px-3.5 text-[16px] text-ink placeholder:text-graphite/80 aria-[invalid=true]:border-error"
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-[13px] font-medium text-error">
          {error}
        </p>
      )}
    </div>
  )
}
