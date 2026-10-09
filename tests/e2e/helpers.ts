import type { Page } from '@playwright/test'

/** Skip the boot screen so tests start on the desktop. */
export async function skipBoot(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('ascendit-booted', '1'))
}
