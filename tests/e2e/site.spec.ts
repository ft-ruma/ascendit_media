import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { skipBoot } from './helpers'

test.beforeEach(async ({ page }) => skipBoot(page))

const TEMPLATES = ['/', '/services/retail-design', '/services/web', '/products', '/products/pos', '/work', '/work/sample-grocer-flagship', '/studio', '/careers', '/start', '/contact', '/legal/privacy']

for (const path of TEMPLATES) {
  test(`axe: no serious violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).exclude('iframe').analyze()
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
  })
}

test('currency switch flips prices without a reload', async ({ page, isMobile }) => {
  test.skip(isMobile, 'switch is in the mobile menu')
  await page.context().addCookies([{ name: 'currency', value: 'USD', url: 'http://localhost:3100' }])
  await page.goto('/products/pos')
  await expect(page.locator('[data-cur="USD"]').first()).toBeVisible()
  await page.getByRole('group', { name: 'Currency' }).getByRole('button', { name: 'LKR' }).click()
  await expect(page.locator('[data-cur="LKR"]').first()).toBeVisible()
  await expect(page.locator('[data-cur="USD"]').first()).toBeHidden()
  const cookies = await page.context().cookies()
  expect(cookies.find((c) => c.name === 'currency')?.value).toBe('LKR')
})

test('no video or media requests before scrolling', async ({ page }) => {
  const media: string[] = []
  page.on('request', (r) => ['media'].includes(r.resourceType()) && media.push(r.url()))
  await page.goto('/', { waitUntil: 'networkidle' })
  expect(media).toEqual([])
})

test('window title opens its page and back returns home', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'retail-design.app', exact: true }).click()
  await expect(page).toHaveURL(/\/services\/retail-design$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Retail store design')
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
})

test('keyboard: skip link and builder modal open/close with Escape', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard run is desktop')
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.getByRole('banner').getByRole('link', { name: 'Start a project' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('old hash anchors redirect', async ({ page }) => {
  await page.goto('/#pricing')
  await expect(page).toHaveURL(/\/products$/)
})

test('robots and sitemap', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /admin')
  expect(await (await request.get('/sitemap.xml')).text()).toContain('/services/retail-design')
})
