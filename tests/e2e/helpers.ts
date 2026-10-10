import type { Page } from '@playwright/test'

/** Skip the desktop boot screen, the phone lock screen and the one-off banner so tests start on the page. */
export async function skipBoot(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('ascendit-booted', '1')
    sessionStorage.setItem('ascendit-unlocked', '1')
    sessionStorage.setItem('ascendit-banner', '1')
  })
}
