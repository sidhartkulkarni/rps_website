import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function fillContact(page: Page) {
  await page.goto('/contact-us')
  await page.locator('#inquiry-name').fill('Test Person')
  await page.locator('#contact-email').fill('tester@example.com')
  await page.locator('#inquiry-subject').fill('Test inquiry')
  await page.locator('#inquiry-message').fill('Synthetic browser test only')
}
const delivered = { status: 'delivered', request_id: '11111111-1111-4111-8111-111111111111' }

test('contact success, loading lock, required payload and no duplicate submit', async ({ page }) => {
  let count = 0
  let release: () => void = () => {}
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/website/contact', async route => {
    count++
    expect(route.request().headers()['idempotency-key']).toMatch(/^[\da-f-]{36}$/)
    expect(route.request().postDataJSON()).toEqual({name:'Test Person',email:'tester@example.com',subject:'Test inquiry',message:'Synthetic browser test only',website:''})
    await pending
    await route.fulfill({json: delivered})
  })
  await fillContact(page)
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled()
  await page.locator('.contact-form').evaluate(form => form.dispatchEvent(new Event('submit', {bubbles:true,cancelable:true})))
  expect(count).toBe(1)
  release()
  await expect(page.locator('#contact-status')).toContainText('accepted by our email provider')
  await expect(page.locator('#inquiry-name')).toHaveValue('')
})

test('503 safe retry preserves key; success only after second provider acceptance', async ({ page }) => {
  const keys: string[] = []
  await page.route('**/api/website/contact', route => {
    keys.push(route.request().headers()['idempotency-key'])
    return route.fulfill(keys.length === 1 ? {status:503,json:{code:'delivery_unavailable',retryable:true}} : {json:delivered})
  })
  await fillContact(page)
  await page.getByRole('button', {name:'Send Inquiry'}).click()
  await expect(page.locator('#contact-status')).toContainText('Please wait, then try again')
  await expect(page.locator('#inquiry-name')).toHaveValue('Test Person')
  await page.getByRole('button', {name:'Send Inquiry'}).click()
  await expect(page.locator('#contact-status')).toContainText('accepted by our email provider')
  expect(keys).toHaveLength(2)
  expect(keys[0]).toBe(keys[1])
})

test('422 is accessible, preserves inputs, changed body gets a new key', async ({ page }) => {
  const keys: string[] = []
  await page.route('**/api/website/contact', route => {
    keys.push(route.request().headers()['idempotency-key'])
    return route.fulfill({status:422,json:{code:'validation_failed',retryable:false}})
  })
  await fillContact(page)
  await page.getByRole('button', {name:'Send Inquiry'}).click()
  await expect(page.getByRole('alert')).toContainText('check all required fields')
  await page.locator('#inquiry-subject').fill('Changed subject')
  await page.getByRole('button', {name:'Send Inquiry'}).click()
  await expect.poll(()=>keys.length).toBe(2)
  expect(keys[0]).not.toBe(keys[1])
})

for (const mode of ['uncertain','network','nginx503','invalidSuccess']) {
  test(`${mode} never claims success or permits accidental resubmission`, async ({ page }) => {
    await page.route('**/api/website/contact', route => {
      if (mode==='network') return route.abort()
      if (mode==='nginx503') return route.fulfill({status:503,body:'Service unavailable',contentType:'text/html'})
      if (mode==='invalidSuccess') return route.fulfill({json:{status:'queued'}})
      return route.fulfill({status:503,json:{code:'delivery_uncertain',retryable:false}})
    })
    await fillContact(page)
    await page.getByRole('button', {name:'Send Inquiry'}).click()
    await expect(page.getByRole('alert')).toContainText('Delivery could not be confirmed')
    await expect(page.getByRole('button', {name:'Send Inquiry'})).toBeDisabled()
    await expect(page.locator('#inquiry-name')).toHaveValue('Test Person')
  })
}

test('newsletter requires consent and reports confirmation pending', async ({ page }) => {
  let calls=0
  await page.route('**/api/website/newsletter', route => {
    calls++
    expect(route.request().postDataJSON()).toEqual({email:'reader@example.com',consent:true,website:''})
    return route.fulfill({json:delivered})
  })
  await page.goto('/')
  await page.locator('#newsletter-email').fill('reader@example.com')
  await page.getByRole('button', {name:'Request Subscription'}).click()
  expect(calls).toBe(0)
  await page.locator('input[name=consent]').check()
  await page.getByRole('button', {name:'Request Subscription'}).click()
  await expect(page.locator('#newsletter-status')).toContainText('not subscribed until you confirm')
  expect(calls).toBe(1)
})
