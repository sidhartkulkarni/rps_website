import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
const id = '11111111-1111-4111-8111-111111111111'
async function events(page: Page) {
  return page.evaluate(() => (window.dataLayer ?? []).filter((item): item is Record<string, string> => typeof item === 'object' && item !== null && 'event' in item))
}
async function preferences(page: Page) { await page.getByRole('button', { name: 'Privacy Settings', exact: true }).click() }
async function accept(page: Page) { await preferences(page); await page.getByRole('checkbox', { name: 'Allow optional Google Analytics' }).check(); await page.getByRole('button', { name: 'Save preferences' }).click() }
async function fields(page: Page) {
  await page.locator('#inquiry-name').fill('PRIVATE_NAME')
  await page.locator('#contact-email').fill('private-person@example.com')
  await page.locator('#inquiry-subject').fill('PRIVATE_SUBJECT')
  await page.locator('#inquiry-message').fill('PRIVATE_MESSAGE')
}
test.beforeEach(async ({ page }) => {
  // Never load/publish the live container or send test data to Google.
  await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '/* inert test container */' }))
  await page.route('https://**.google-analytics.com/**', route => route.abort())
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('no Google request or events before consent; rejection persists', async ({ page }) => {
  const requests: string[] = []
  page.on('request', req => { if (req.url().includes('googletagmanager.com')) requests.push(req.url()) })
  await page.goto('/')
  expect(await events(page)).toEqual([])
  await preferences(page)
  await page.getByRole('button', { name: 'Reject analytics', exact: true }).click()
  await page.locator('.hero-actions a').first().click()
  expect(await events(page)).toEqual([])
  await page.reload()
  await expect(page.locator('.analytics-banner')).toHaveCount(0)
  expect(requests).toEqual([])
})

test('accept loads container once and SPA pageviews have no duplicates', async ({ page }) => {
  const loads: string[] = []
  page.on('request', req => { if (req.url().includes('/gtm.js')) loads.push(req.url()) })
  await page.goto('/')
  await accept(page)
  await page.locator('#main-navigation a[href="/contact-us"]').click()
  await page.locator('#main-navigation a[href="/contact-us"]').click()
  await page.locator('#main-navigation a[href="/"]').click()
  expect(loads).toEqual(['https://www.googletagmanager.com/gtm.js?id=GTM-KM945ZXM'])
  await expect.poll(async () => (await events(page)).map(item => item.page_location)).toEqual(['https://rapidpacknship.com/', 'https://rapidpacknship.com/contact-us', 'https://rapidpacknship.com/'])
  await page.reload()
  await expect(page.locator('.analytics-banner')).toHaveCount(0)
  await expect.poll(async () => (await events(page)).length).toBe(1)
})

test('preferences are keyboard usable and withdrawal reloads without tags', async ({ page }) => {
  await page.goto('/')
  await accept(page)
  await page.evaluate(() => { document.cookie = '_ga=synthetic; path=/' })
  await page.getByRole('button', { name: 'Privacy Settings', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Privacy Settings', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Privacy Settings', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Allow optional Google Analytics' }).uncheck()
  await page.getByRole('button', { name: 'Save preferences' }).click()
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('rps.analytics-consent.v1')!).analytics)).toBe(false)
  expect(await page.evaluate(() => document.cookie)).not.toContain('_ga=')
  expect(await events(page)).toEqual([])
})

test('contact successes deduplicate by response ID across reload; failures never count', async ({ page }) => {
  let fail = true
  await page.route('**/api/website/contact', route => route.fulfill(fail ? { status: 503, json: { code: 'delivery_unavailable', retryable: true } } : { json: { status: 'delivered', request_id: id } }))
  await page.goto('/contact-us')
  await accept(page)
  await fields(page)
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect(page.locator('#contact-status')).toContainText('unavailable')
  expect((await events(page)).filter(item => item.event === 'generate_lead')).toHaveLength(0)
  fail = false
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect.poll(async () => (await events(page)).filter(item => item.event === 'generate_lead').length).toBe(1)
  await fields(page)
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect(page.locator('#contact-status')).toContainText('accepted')
  expect((await events(page)).filter(item => item.event === 'generate_lead')).toHaveLength(1)
  const serialized = JSON.stringify(await events(page))
  for (const privateValue of ['PRIVATE', 'private-person', '@', id, '866', '7447']) expect(serialized).not.toContain(privateValue)
  await page.reload()
  await fields(page)
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect(page.locator('#contact-status')).toContainText('accepted')
  expect((await events(page)).filter(item => item.event === 'generate_lead')).toHaveLength(0)
})

test('newsletter request is not a confirmed signup and exposes no email', async ({ page }) => {
  await page.route('**/api/website/newsletter', route => route.fulfill({ json: { status: 'delivered', request_id: id } }))
  await page.goto('/')
  await accept(page)
  await page.locator('#newsletter-email').fill('private-person@example.com')
  await page.locator('input[name="consent"]').check()
  await page.getByRole('button', { name: 'Request Subscription' }).click()
  await expect.poll(async () => (await events(page)).filter(item => item.event === 'newsletter_request').length).toBe(1)
  expect((await events(page)).some(item => ['sign_up','generate_lead'].includes(item.event))).toBe(false)
  expect(JSON.stringify(await events(page))).not.toContain('private-person')
})

test('contact action events use only fixed names and page metadata', async ({ page }) => {
  await page.goto('/')
  await accept(page)
  await page.evaluate(() => document.addEventListener('click', event => event.preventDefault()))
  await page.locator('a[href="tel:+18669597447"]').first().click()
  await page.locator('a[href="mailto:sales@rapidpacknship.com"]').first().click()
  await page.locator('.hero-actions a[data-analytics-cta]').click()
  expect((await events(page)).map(item => item.event)).toEqual(['analytics_page_view', 'click_to_call', 'click_email', 'quote_cta_click'])
  for (const event of await events(page)) expect(Object.keys(event).sort()).toEqual(['event','page_location','page_referrer','page_title'])
})

test('query, fragment, unknown and API/token routes never load analytics', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rps.analytics-consent.v1', JSON.stringify({ version: 1, analytics: true, saved: Date.now() })))
  const requests: string[] = []
  page.on('request', req => { if (req.url().includes('googletagmanager.com')) requests.push(req.url()) })
  for (const path of ['/contact-us?email=private-person@example.com','/contact-us#token=PRIVATE_TOKEN','/unknown','/api/website/newsletter/confirm#token=PRIVATE_TOKEN','/api/website/newsletter/unsubscribe#token=PRIVATE_TOKEN']) {
    await page.goto(path)
    await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
    expect(await events(page)).toEqual([])
  }
  expect(requests).toEqual([])
})

test('storage failure stays opt-in and does not break forms', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('blocked') }
    Storage.prototype.setItem = () => { throw new Error('blocked') }
  })
  await page.goto('/contact-us')
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
  await accept(page)
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(1)
  await expect(page.locator('#inquiry-name')).toBeEnabled()
  await page.reload()
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
})

test('no-consent success is not replayed after later acceptance', async ({ page }) => {
  await page.route('**/api/website/contact', route => route.fulfill({ json: { status: 'delivered', request_id: id } }))
  await page.goto('/contact-us')
  await preferences(page)
  await page.getByRole('button', { name: 'Reject analytics', exact: true }).click()
  await fields(page)
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect(page.locator('#contact-status')).toContainText('accepted')
  await page.getByRole('button', { name: 'Privacy Settings', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Allow optional Google Analytics' }).check()
  await page.getByRole('button', { name: 'Save preferences' }).click()
  expect((await events(page)).filter(item => item.event === 'generate_lead')).toHaveLength(0)
})


test('expired consent fails closed and mobile controls fit', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rps.analytics-consent.v1', JSON.stringify({ version: 1, analytics: true, saved: Date.now() - 181 * 86400000 })))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('.privacy-toast')).toBeVisible()
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.locator('.privacy-toast')).toHaveCSS('color', 'rgb(36, 36, 36)')
  await page.screenshot({ path: '../artifacts/analytics-consent-mobile.png' })
  await page.getByRole('button', { name: 'Privacy settings.', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.analytics-dialog h2')).toHaveCSS('color', 'rgb(36, 36, 36)')
  await page.screenshot({ path: '../artifacts/analytics-preferences-mobile.png' })
  await page.getByRole('button', { name: 'Save preferences' }).click()
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
})

test('sensitive fragment navigation unloads previously accepted tracking', async ({ page }) => {
  await page.goto('/')
  await accept(page)
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(1)
  await page.evaluate(() => { location.hash = 'token=PRIVATE_TOKEN' })
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
  expect(await events(page)).toEqual([])
})

for (const width of [1280, 390]) {
  test(`informational toast disappears without consent and stays dismissed at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const toast = page.locator('.privacy-toast')
    await expect(toast).toBeVisible()
    await expect(toast).toContainText('We use analytics to improve our website. Privacy settings.')
    expect(await toast.boundingBox()).toMatchObject({ x: 16 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(toast).toHaveCSS('opacity', '1')
    await page.screenshot({ path: `../artifacts/privacy-toast-${width}.png` })
    await expect(toast).toHaveCount(0, { timeout: 7000 })
    expect(await page.evaluate(() => localStorage.getItem('rps.analytics-consent.v1'))).toBeNull()
    expect(await events(page)).toEqual([])
    await page.goto('/contact-us')
    await expect(toast).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Privacy Settings', exact: true })).toBeVisible()
    await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
  })
}

test('toast dismissal is not consent; focus pauses expiry and reduced motion disables animation', async ({ page }) => {
  await page.goto('/')
  const close = page.getByRole('button', { name: 'Dismiss privacy notice' })
  await close.focus()
  await expect(page.locator('.privacy-toast')).toHaveCSS('animation-name', 'none')
  await page.waitForTimeout(5500)
  await expect(close).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('.privacy-toast')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Privacy Settings', exact: true })).toBeFocused()
  expect(await events(page)).toEqual([])
  expect(await page.evaluate(() => localStorage.getItem('rps.analytics-consent.v1'))).toBeNull()
})

test('GPC overrides prior acceptance, prevents opt-in and sends nothing', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true })
    localStorage.setItem('rps.analytics-consent.v1', JSON.stringify({ version: 1, analytics: true, saved: Date.now() }))
  })
  const requests: string[] = []
  page.on('request', req => { if (req.url().includes('googletagmanager.com')) requests.push(req.url()) })
  await page.goto('/')
  await preferences(page)
  await expect(page.getByRole('checkbox', { name: 'Allow optional Google Analytics' })).toBeDisabled()
  await expect(page.getByRole('checkbox', { name: 'Allow optional Google Analytics' })).not.toBeChecked()
  await expect(page.getByRole('dialog')).toContainText('Global Privacy Control')
  await page.getByRole('button', { name: 'Save preferences' }).click()
  expect(await events(page)).toEqual([])
  expect(requests).toEqual([])
})

test('old explicit opt-outs remain effective without renewal', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rps.analytics-consent.v1', JSON.stringify({ version: 1, analytics: false, saved: Date.now() - 400 * 86400000 })))
  await page.goto('/')
  await preferences(page)
  await expect(page.getByRole('checkbox', { name: 'Allow optional Google Analytics' })).not.toBeChecked()
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
  expect(await events(page)).toEqual([])
})

test('a newly enabled GPC signal unloads tracking on return to the window', async ({ page }) => {
  await page.goto('/')
  await accept(page)
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(1)
  await page.addInitScript(() => Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }))
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true })
    window.dispatchEvent(new Event('focus'))
  })
  await expect(page.locator('#rps-gtm-loaded')).toHaveCount(0)
  expect(await events(page)).toEqual([])
})
