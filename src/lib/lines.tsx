import { Fragment } from 'react'

/** Renders CMS text with its line breaks as <br /> (titles that break on desktop). */
export function Lines({ text }: { text: string }) {
  const parts = text.split('\n')
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {p}
        </Fragment>
      ))}
    </>
  )
}
