import { test, expect } from '@playwright/test'
import { pageMetadata, routeAliases, siteOrigin } from '../src/data/seo'

for (const width of [390, 1280]) {
  test(`static pages hydrate and fit viewport ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    for (const meta of pageMetadata) {
      const response = await page.goto(meta.path)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', siteOrigin + meta.path)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy()
      expect(await page.locator('img').evaluateAll(images => images.every(image => image.hasAttribute('alt')))).toBeTruthy()
      const schema = JSON.parse(await page.locator('#structured-data').textContent() ?? '{}')
      expect(schema['@context']).toBe('https://schema.org')
    }
    await page.goto('/')
    await page.screenshot({ path: `../artifacts/seo-home-${width}.png` })
    await page.goto('/contact-us')
    await page.screenshot({ path: `../artifacts/seo-contact-${width}.png`, fullPage: true })
    expect(errors).toEqual([])
  })
}

test('initial HTML is readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  for (const meta of pageMetadata.filter(item => item.indexable)) {
    await page.goto('http://127.0.0.1:5191' + meta.path)
    await expect(page.locator('main h1')).toBeVisible()
    expect((await page.locator('main').innerText()).length).toBeGreaterThan(100)
  }
  await page.goto('http://127.0.0.1:5191/contact-us')
  await expect(page.getByRole('button', { name: 'Send Inquiry' })).toBeDisabled()
  await expect(page.locator('.contact-form')).toHaveAttribute('method', 'post')
  await context.close()
})

test('preview enforces reviewed aliases, slash normalization and real 404', async ({ request }) => {
  for (const [alias, target] of Object.entries(routeAliases)) {
    const response = await request.get(alias, { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe(target)
  }
  const slash = await request.get('/about-us/?source=test', { maxRedirects: 0 })
  expect(slash.status()).toBe(308)
  expect(slash.headers().location).toBe('/about-us?source=test')
  for (const path of ['/not-a-real-page', '/service-detail/not-a-service']) {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(await response.text()).toContain('noindex,follow')
    expect(await response.text()).not.toContain('rel="canonical"')
  }
})


test('client navigation updates metadata and mobile menu remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.locator('#main-navigation').getByRole('link', { name: 'Services', exact: true }).click()
  await expect(page).toHaveURL(/\/services$/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', siteOrigin + '/services')
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', siteOrigin + '/services')
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused()
})

test('videos do not download on initial load and root index redirects', async ({ page, request }) => {
  const videos: string[] = []
  page.on('request', req => { if (req.url().endsWith('.mp4')) videos.push(req.url()) })
  await page.goto('/how-it-works')
  await expect(page.locator('video')).toHaveCount(2)
  expect(await page.locator('video').evaluateAll(items => items.every(item => item.preload === 'none' && !item.autoplay))).toBeTruthy()
  expect(videos).toEqual([])
  const response = await request.get('/index.html', { maxRedirects: 0 })
  expect(response.status()).toBe(308)
  expect(response.headers().location).toBe('/')
})


// Existing functional/visual scenarios run with analytics explicitly rejected.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rps.analytics-consent.v1', JSON.stringify({ version: 1, analytics: false, saved: Date.now() })))
})
