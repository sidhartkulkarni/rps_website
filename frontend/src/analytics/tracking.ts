import { metadataFor, siteOrigin } from '../data/seo'

export type Consent = 'unset' | 'accepted' | 'rejected'
export type AnalyticsEvent = 'generate_lead' | 'newsletter_request' | 'click_to_call' | 'click_email' | 'quote_cta_click'
const consentKey = 'rps.analytics-consent.v1'
const lifetime = 180 * 86400000
let memory: Consent | undefined
let loaded = false
let lastPage = ''
const seen = new Set<string>()
const listeners = new Set<() => void>()
declare global {
  interface Window {
    dataLayer?: unknown[]
    'ga-disable-G-X9QN5W2GTB'?: boolean
  }
}
export function hasGlobalPrivacyControl(): boolean {
  return typeof navigator !== 'undefined' && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}
export function getConsent(): Consent {
  if (hasGlobalPrivacyControl()) return 'rejected'
  if (memory) return memory
  try {
    const stored = JSON.parse(localStorage.getItem(consentKey) ?? 'null')
    if (stored?.version === 1 && typeof stored.analytics === 'boolean' && typeof stored.saved === 'number' && stored.saved <= Date.now() && (!stored.analytics || Date.now() - stored.saved < lifetime)) return stored.analytics ? 'accepted' : 'rejected'
  } catch { /* Missing/unavailable storage fails closed. */ }
  return 'unset'
}
export function subscribeConsent(listener: () => void) {
  listeners.add(listener)
  const change = (event: Event) => {
    if (event.type === 'storage') memory = undefined
    if (getConsent() !== 'accepted') window['ga-disable-G-X9QN5W2GTB'] = true
    if (loaded && getConsent() !== 'accepted') stopAndReload()
    listener()
  }
  window.addEventListener('storage', change)
  window.addEventListener('focus', change)
  document.addEventListener('visibilitychange', change)
  return () => { listeners.delete(listener); window.removeEventListener('storage', change); window.removeEventListener('focus', change); document.removeEventListener('visibilitychange', change) }
}
function stopAndReload() {
  window['ga-disable-G-X9QN5W2GTB'] = true
  // Remove only known first-party GA cookies, not unrelated application cookies.
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0]
    if (!/^_ga(?:_|$)/.test(name)) continue
    for (const domain of ['', location.hostname, '.rapidpacknship.com']) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? '; domain=' + domain : ''}`
    }
  }
  // Removing a script element cannot unload listeners. A fresh denied document can.
  window.location.reload()
}
export function setConsent(analytics: boolean) {
  analytics = analytics && !hasGlobalPrivacyControl()
  memory = analytics ? 'accepted' : 'rejected'
  try { localStorage.setItem(consentKey, JSON.stringify({ version: 1, analytics, saved: Date.now() })) } catch { /* Session-memory choice only. */ }
  listeners.forEach(listener => listener())
  if (!analytics && loaded) stopAndReload()
  else if (analytics) trackPage()
}
function safePage() {
  // Do not let Google code observe token-bearing or otherwise unreviewed URLs.
  const sectionAnchors = ['#how-it-works', '#contact', '#about', '#services', '#main-content']
  if (location.search || (location.hash && !sectionAnchors.includes(location.hash))) return undefined
  const page = metadataFor(location.pathname)
  if (!page || page.path !== location.pathname) return undefined
  return page
}
function allowed() { return getConsent() === 'accepted' && Boolean(safePage()) }
function loadContainer() {
  if (loaded) return
  if (document.getElementById('rps-gtm-loaded')) { loaded = true; return }
  const template = document.getElementById('rps-gtm-template') as HTMLTemplateElement | null
  const source = template?.content.querySelector<HTMLScriptElement>('script[src]')
  const bootstrap = template?.content.querySelector<HTMLScriptElement>('script:not([src])')
  if (!source || !bootstrap) return
  loaded = true
  window.dataLayer ??= []
  const page = safePage()!
  window.dataLayer.push({ rps_analytics_allowed: true, page_location: siteOrigin + page.path, page_title: page.title + ' | Rapid Pack N Ship', page_referrer: '' })
  // Current Google bootstrap, installed once; no independent GA4 script.
  const init = document.createElement('script')
  init.textContent = bootstrap.textContent
  document.head.append(init)
  const script = document.createElement('script')
  script.id = 'rps-gtm-loaded'
  script.async = true
  script.src = source.src
  script.referrerPolicy = 'no-referrer'
  document.head.append(script)
}
function push(event: AnalyticsEvent | 'analytics_page_view') {
  if (!allowed()) {
    window['ga-disable-G-X9QN5W2GTB'] = true
    if (loaded) stopAndReload()
    return
  }
  const page = safePage()!
  loadContainer()
  if (!loaded) return
  window['ga-disable-G-X9QN5W2GTB'] = false
  window.dataLayer!.push({ event, page_location: siteOrigin + page.path, page_title: page.title + ' | Rapid Pack N Ship', page_referrer: '' })
}
export function trackPage() {
  if (!allowed()) {
    window['ga-disable-G-X9QN5W2GTB'] = true
    // Sensitive client navigation must unload already-installed Google listeners.
    if (loaded && (getConsent() !== 'accepted' || !safePage())) stopAndReload()
    return
  }
  const path = safePage()!.path
  if (lastPage === path) return
  lastPage = path
  push('analytics_page_view')
}
export function track(event: AnalyticsEvent) { push(event) }
export async function trackSuccess(kind: 'contact' | 'newsletter', requestId: string) {
  // Never send the response identifier. Retain only a local digest for replay suppression.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) return
  const key = kind + ':' + requestId
  if (seen.has(key)) return
  seen.add(key)
  if (!allowed()) return // No pre-consent conversion queue/backfill.
  try {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
    const digest = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('')
    const storageKey = 'rps.analytics-replays.v1'
    let values: string[] = []
    try {
      const parsed: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]')
      if (Array.isArray(parsed)) values = parsed.filter((item): item is string => typeof item === 'string' && /^[a-f0-9]{64}$/.test(item)).slice(-500)
      if (values.includes(digest)) return
      sessionStorage.setItem(storageKey, JSON.stringify([...values, digest].slice(-500)))
    } catch { /* In-memory dedup remains effective if storage is unavailable. */ }
    push(kind === 'contact' ? 'generate_lead' : 'newsletter_request')
  } catch { /* Analytics failure must not affect successful form submission. */ }
}
