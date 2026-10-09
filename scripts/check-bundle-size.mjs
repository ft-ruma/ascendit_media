// Fails CI when a public route ships more than 200 KB of JS (gzip) on first load.
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import path from 'node:path'

const BUDGET_KB = 200
const manifest = JSON.parse(readFileSync('.next/app-build-manifest.json', 'utf8'))
const size = new Map()
const gz = (f) => {
  if (!size.has(f)) size.set(f, gzipSync(readFileSync(path.join('.next', f))).length)
  return size.get(f)
}

let failed = false
for (const [route, files] of Object.entries(manifest.pages)) {
  if (!route.startsWith('/(site)') || !route.endsWith('/page')) continue
  const kb = files.filter((f) => f.endsWith('.js')).reduce((n, f) => n + gz(f), 0) / 1024
  const ok = kb <= BUDGET_KB
  failed ||= !ok
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${kb.toFixed(1).padStart(6)} KB  ${route.replace('/(site)', '').replace(/\/page$/, '') || '/'}`)
}
if (failed) {
  console.error(`\nA public route is over the ${BUDGET_KB} KB first-load JS budget.`)
  process.exit(1)
}
