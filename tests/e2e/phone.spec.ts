import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { skipBoot } from './helpers'

// Phone + tablet edition. Runs once (desktop project skips it) and sets its own viewports.
test.beforeEach(({}, info) => test.skip(info.project.name !== 'phone', 'phone edition tests run once, in the phone project'))

const touch = { isMobile: true, hasTouch: true }

async function swipe(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  const cdp = await page.context().newCDPSession(page)
  const point = (p: { x: number; y: number }) => [{ x: p.x, y: p.y, id: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(from) })
  for (let i = 1; i <= 8; i++) {
    const p = { x: from.x + ((to.x - from.x) * i) / 8, y: from.y + ((to.y - from.y) * i) / 8 }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(p) })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

for (const width of [375, 390, 430]) {
  test.describe(`phone ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, ...touch })

    test('lock screen shows once, auto-unlocks, and passes axe once settled', async ({ page }) => {
      await page.goto('/')
      const lock = page.locator('.lockscreen')
      await expect(lock).toBeVisible()
      await expect(page.locator('#lock-time')).toHaveText(/\d\d:\d\d/)
      await page.waitForTimeout(1100) // cards finished sliding in
      const { violations } = await new AxeBuilder({ page }).include('.lockscreen').analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
      await expect(lock).toBeHidden({ timeout: 4000 })
      await page.reload()
      await expect(lock).toBeHidden()
    })

    test('home screen: every app icon is a real link that opens its page', async ({ page }) => {
      await skipBoot(page)
      await page.goto('/')
      const apps = page.getByRole('navigation', { name: 'Apps' })
      for (const [name, path] of [['Work', '/work'], ['POS', '/products/pos'], ['Notes', '/notes'], ['Photos', '/photos'], ['Messages', '/messages'], ['Studio', '/studio'], ['Careers', '/careers'], ['Contact', '/contact']] as const) {
        await expect(apps.getByRole('link', { name, exact: true })).toHaveAttribute('href', path)
      }
      await apps.getByRole('button', { name: 'Services' }).tap()
      await expect(page.getByRole('dialog', { name: 'Services' }).getByRole('link', { name: 'Software & AI' })).toHaveAttribute('href', '/services/software')
      await page.getByRole('dialog', { name: 'Services' }).getByRole('link', { name: 'Retail Design' }).tap()
      await expect(page).toHaveURL(/\/services\/retail-design$/)
      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
      await page.goBack()
      await expect(page).toHaveURL(/\/$/)
    })

    test('app view: large title collapses into the nav bar; edge swipe goes back', async ({ page }) => {
      await skipBoot(page)
      await page.goto('/')
      await page.getByRole('navigation', { name: 'Apps' }).getByRole('link', { name: 'Work', exact: true }).tap()
      await expect(page).toHaveURL(/\/work$/)
      const compact = page.locator('.app-nav p')
      await expect(compact).toHaveClass(/opacity-0/)
      await page.mouse.wheel(0, 600)
      await expect(compact).toHaveClass(/opacity-100/)
      await swipe(page, { x: 6, y: 400 }, { x: 200, y: 410 })
      await expect(page).toHaveURL(/\/$/)
    })

    test('dock hides on scroll down and returns on scroll up', async ({ page }) => {
      await skipBoot(page)
      await page.goto('/')
      const dock = page.locator('nav.phone-dock')
      await page.mouse.wheel(0, 900)
      await expect.poll(async () => dock.evaluate((el) => el.style.transform)).toContain('translateY')
      await page.mouse.wheel(0, -300)
      await expect.poll(async () => dock.evaluate((el) => el.style.transform)).toBe('')
    })
  })
}

test.describe('phone 390px flows', () => {
  test.use({ viewport: { width: 390, height: 844 }, ...touch })

  test('builder bottom sheet: one question per screen, estimate card, submit, island confirmation', async ({ page }) => {
    await skipBoot(page)
    await page.context().addCookies([{ name: 'currency', value: 'LKR', url: 'http://localhost:3100' }])
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name: 'Start a project' }).tap()
    const sheet = page.getByRole('dialog', { name: 'New project brief' })
    await expect(sheet).toBeVisible()
    await expect(page.locator('.island')).toHaveText(/Brief 1 of 6/)
    await sheet.getByText('Web', { exact: true }).tap()
    await sheet.getByRole('button', { name: 'Next' }).tap()
    for (const a of ['Retail', '1 to 9 people', 'Overseas', 'Website', '1 to 5 pages', 'Under a month', 'LKR 250k to 750k']) {
      await sheet.getByText(a, { exact: true }).tap()
    }
    await expect(sheet.getByText('estimate.calc')).toBeVisible()
    await expect(sheet.getByText(/LKR\s180,000/)).toBeVisible()
    const name = sheet.getByLabel('Name')
    expect(await name.evaluate((el) => getComputedStyle(el).fontSize)).toBe('16px') // no zoom on focus
    await name.fill('Phone Test')
    await sheet.getByLabel('Email').fill('phone@example.com')
    await sheet.getByLabel('WhatsApp').fill('+94 77 123 4567')
    await sheet.getByRole('button', { name: 'Send brief' }).tap()
    await expect(sheet.getByRole('heading', { name: 'Brief sent' })).toBeVisible()
    await expect(page.locator('.island')).toHaveText(/Brief sent/)
  })

  test('Control Center: sound, volume, reduce motion and currency persist', async ({ page }) => {
    await skipBoot(page)
    await page.goto('/')
    await page.getByRole('button', { name: /Open Control Center/ }).tap()
    const cc = page.getByRole('dialog', { name: 'Control Center' })
    await expect(cc.getByRole('button', { name: /Sound/ })).toHaveAttribute('aria-pressed', 'false')
    await cc.getByRole('button', { name: /Sound/ }).tap()
    await expect(cc.getByRole('button', { name: /Sound/ })).toHaveAttribute('aria-pressed', 'true')
    await cc.getByLabel(/Volume/).fill('0.2')
    await cc.getByRole('button', { name: 'LKR' }).tap()
    await expect(page.locator('.island')).toHaveText(/Ascendit sound/)
    await cc.getByRole('button', { name: /Reduce motion/ }).tap()
    await expect(page.locator('html')).toHaveAttribute('data-reduce-motion', '')
    const stored = await page.evaluate(() => ({ sound: localStorage.getItem('ascendit-sound'), comfort: localStorage.getItem('ascendit-comfort') }))
    expect(JSON.parse(stored.sound!).state).toMatchObject({ enabled: false, volume: 0.2 }) // reduce motion turns sound off
    expect(JSON.parse(stored.comfort!).state.reduceMotion).toBe(true)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-reduce-motion', '')
    await expect(page.locator('html')).toHaveAttribute('data-currency', 'LKR')
  })

  test('swipe down from the top right opens Control Center', async ({ page }) => {
    await skipBoot(page)
    await page.goto('/', { waitUntil: 'networkidle' }) // the phone runtime loads lazily after hydration
    await swipe(page, { x: 340, y: 20 }, { x: 340, y: 160 })
    await expect(page.getByRole('dialog', { name: 'Control Center' })).toBeVisible()
  })

  test('one social-proof banner per session, swipe up to dismiss', async ({ page }) => {
    await page.clock.install()
    await page.addInitScript(() => sessionStorage.setItem('ascendit-unlocked', '1'))
    await page.goto('/', { waitUntil: 'networkidle' }) // banner timer starts once the lazy phone runtime is in
    await page.clock.runFor(15_000)
    const banner = page.getByRole('status').filter({ hasText: 'New case study' })
    await expect(banner).toBeVisible()
    await banner.getByRole('button', { name: 'Dismiss' }).tap()
    await expect(banner).toBeHidden()
    await page.reload({ waitUntil: 'networkidle' })
    await page.clock.runFor(15_000)
    await expect(banner).toBeHidden()
  })

  test('messages, notes and photos keep their full text in the HTML', async ({ request }) => {
    const notes = await (await request.get('/notes')).text()
    expect(notes).toContain('We started Ascendit because shop owners')
    const msgs = await (await request.get('/messages')).text()
    expect(msgs).toContain('They designed the shop, set up the POS')
  })

  for (const path of ['/', '/notes', '/messages', '/photos', '/products/pos', '/services/retail-design']) {
    test(`axe on phone ${path}`, async ({ page }) => {
      await skipBoot(page)
      await page.goto(path)
      await page.waitForTimeout(500)
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).exclude('iframe').analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
    })
  }
})

test.describe('tablet', () => {
  for (const width of [768, 1023]) {
    test(`${width}px: home screen with 6-column grid and a centred builder`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width, height: 1024 }, ...touch })
      const page = await ctx.newPage()
      await skipBoot(page)
      await page.goto('/')
      await expect(page.getByRole('navigation', { name: 'Apps' })).toBeVisible()
      const cols = await page.getByRole('navigation', { name: 'Apps' }).locator('ul').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)
      expect(cols).toBe(6)
      await page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name: 'Start a project' }).tap()
      const box = await page.getByRole('dialog', { name: 'New project brief' }).boundingBox()
      expect(box!.y).toBeGreaterThan(20) // centred, not a bottom sheet
      expect(Math.round(box!.x + box!.width / 2)).toBeCloseTo(width / 2, -1)
      await ctx.close()
    })
  }

  test('1024px is the desktop (menu bar, no status bar)', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 900 } })
    const page = await ctx.newPage()
    await skipBoot(page)
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
    await expect(page.locator('.status-bar')).toBeHidden()
    await expect(page.getByRole('navigation', { name: 'Apps' })).toBeHidden()
    await ctx.close()
  })
})
