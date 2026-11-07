import { test, expect } from '@playwright/test'
import { pageMetadata } from '../src/data/seo'

for (const width of [390, 1280]) {
  test(`legacy header animation keeps layout and home link at ${width}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/contact-us')
    const intro = page.locator('.header-intro.is-running')
    await expect(intro).toBeVisible()
    const header = page.locator('.site-header')
    const initial = await header.boundingBox()
    const logo = page.locator('.header-logo')
    const logoBox = await logo.boundingBox()
    await expect(logo.locator('..')).toHaveAttribute('href', '/')
    expect(await intro.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none')
    // Inspect the original animation at deterministic positions, without changing layout.
    for (const time of [300, 1500]) {
      await intro.evaluate((el, time) => el.getAnimations({ subtree: true }).forEach(animation => {
        animation.pause(); animation.currentTime = time
      }), time)
      await header.screenshot({ path: `../artifacts/logo-${width}-${time}.png` })
      expect(await header.boundingBox()).toEqual(initial)
      expect(await logo.boundingBox()).toEqual(logoBox)
    }
    await intro.evaluate(el => el.getAnimations({ subtree: true }).forEach(animation => animation.play()))
    await expect(page.locator('.header-intro')).toHaveCount(0, { timeout: 5000 })
    expect(await header.boundingBox()).toEqual(initial)
    expect(await logo.boundingBox()).toEqual(logoBox)
    await logo.click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('.header-intro')).toHaveCount(0)
  })
}

test('reduced motion keeps static logo and never requests mascot', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const requests: string[] = []
  page.on('request', request => { if (request.url().includes('header-vid.gif')) requests.push(request.url()) })
  await page.goto('/')
  await expect(page.locator('.header-logo')).toBeVisible()
  await expect(page.locator('.header-intro')).toHaveCount(0)
  expect(requests).toEqual([])
})

test('every public page uses the new public telephone link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const meta of pageMetadata) {
    await page.goto(meta.path)
    const links = page.locator('a[href^="tel:"]')
    expect(await links.count()).toBeGreaterThan(0)
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('href', 'tel:+18669597447')
      await expect(link).toHaveText('866-959-7447')
    }
  }
})


// Existing functional/visual scenarios run with analytics explicitly rejected.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rps.analytics-consent.v1', JSON.stringify({ version: 1, analytics: false, saved: Date.now() })))
})
