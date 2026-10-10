// Desktop regression snapshots: captures every route at 1024/1280/1440 with
// reduced motion and the clock masked, so two runs can be diffed pixel by pixel.
// Usage: node tests/visual/desktop-snap.mjs <outDir> [baseURL]
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const out = process.argv[2]
const base = process.argv[3] ?? 'http://localhost:3100'
const ROUTES = ['/', '/services/retail-design', '/services/web', '/products', '/products/pos', '/work', '/work/sample-grocer-flagship', '/studio', '/careers', '/careers/front-end-developer', '/start', '/contact', '/legal/privacy']
const WIDTHS = [1024, 1280, 1440]
mkdirSync(out, { recursive: true })
const b = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'chrome' })
for (const w of WIDTHS) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' })
  await ctx.addInitScript(() => sessionStorage.setItem('ascendit-booted', '1'))
  const p = await ctx.newPage()
  for (const r of ROUTES) {
    await p.goto(base + r, { waitUntil: 'networkidle' })
    await p.waitForTimeout(800)
    const name = `${w}${r.replace(/\//g, '_') || '_home'}`
    // Fixed/sticky chrome jitters in full-page captures, so check it in a viewport shot taken before any scrolling...
    await p.screenshot({ path: `${out}/${name}.top.png`, animations: 'disabled', mask: [p.getByLabel('Time in Colombo')] })
    for (let y = 0; y < 14000; y += 500) { await p.mouse.wheel(0, 500); await p.waitForTimeout(60) }
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await p.waitForFunction(() => window.scrollY === 0)
    await p.waitForTimeout(800)
    // ...and hide it (visibility only, so layout is unchanged) for the full page.
    const chrome = await p.addStyleTag({ content: 'header.sticky, nav[aria-label="Dock"] { visibility: hidden !important }' })
    await p.screenshot({ path: `${out}/${name}.full.png`, fullPage: true, animations: 'disabled', mask: [p.locator('iframe')] })
    await chrome.evaluate((el) => el.remove())
  }
  await ctx.close()
}
await b.close()
console.log('snapshots in', out)
