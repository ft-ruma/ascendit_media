import { expect, test } from '@playwright/test'
import { skipBoot } from './helpers'

test.beforeEach(async ({ page }) => skipBoot(page))

test('builder happy path sends a brief and shows a reference', async ({ page, isMobile }) => {
  await page.context().addCookies([{ name: 'currency', value: 'LKR', url: 'http://localhost:3100' }])
  await page.goto('/start')
  await page.getByRole('checkbox', { name: /^Retail design/ }).check()
  await page.getByRole('checkbox', { name: /^Ascendit POS/ }).check()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('Grocery & FMCG').check()
  await page.getByLabel('10 to 49 people').check()
  await page.getByLabel('Sri Lanka').check()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('Floor area (sq ft)').fill('2000')
  await page.getByLabel('Design only').check()
  await page.getByLabel('Render stills').check()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('1 to 3 months').check()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('LKR 250k to 750k').check()
  await page.getByRole('button', { name: 'Next' }).click()
  const estimate = isMobile ? page.locator('form').getByText('Project estimate') : page.getByRole('complementary', { name: 'Your estimate' }).getByText('Project estimate')
  await expect(estimate).toBeVisible()
  await page.getByRole('textbox', { name: 'Name' }).fill('Playwright Test')
  await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com')
  await page.getByRole('textbox', { name: 'WhatsApp' }).fill('+94 77 123 4567')
  await page.getByRole('button', { name: 'Send brief' }).click()
  await expect(page.getByText('Brief sent.')).toBeVisible()
  await expect(page.getByText(/ASC-\d{6}-[0-9A-F]{4}/)).toBeVisible()
})

test('step validation blocks empty answers', async ({ page }) => {
  await page.goto('/start')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('alert').first()).toContainText('Pick at least one')
})

test('partial lead is beaconed when the tab is hidden', async ({ page }) => {
  await page.goto('/start')
  // Jump straight to the contact step with a valid email already typed.
  await page.evaluate(() => {
    sessionStorage.setItem('ascendit-builder', JSON.stringify({ state: {
      draft: { what: { pillars: ['web'], products: [] }, business: { industry: 'Retail', size: '1-9', location: 'LK', registered: false }, scope: { web: { type: 'site', pages: '1-5' } }, timeline: '1-3m', budget: 'usd-2', contact: { email: 'partial@example.com', bestTime: 'any' } },
      step: 5, status: 'editing', reference: null, source: 'test', partialKey: null }, version: 0 }))
  })
  await page.reload()
  await expect(page.getByLabel('Email')).toHaveValue('partial@example.com')
  const beacon = page.waitForRequest((r) => r.url().endsWith('/api/lead') && r.method() === 'POST')
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  // Chrome does not expose sendBeacon bodies to the test runner; the payload shape is covered by the lead schema unit tests.
  await beacon
})
