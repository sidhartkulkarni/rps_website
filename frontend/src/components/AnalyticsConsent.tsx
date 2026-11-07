import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getConsent, hasGlobalPrivacyControl, setConsent, subscribeConsent } from '../analytics/tracking'

const noticeKey = 'rps.privacy-notice.v1'
let shownThisDocument = false

export default function AnalyticsConsent() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => 'unset' as const)
  const [notice, setNotice] = useState<'hidden' | 'visible' | 'leaving'>('hidden')
  const [paused, setPaused] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const checkbox = useRef<HTMLInputElement>(null)
  const settings = useRef<HTMLButtonElement>(null)
  const toast = useRef<HTMLElement>(null)
  const gpc = useSyncExternalStore(subscribeConsent, hasGlobalPrivacyControl, () => false)

  useEffect(() => {
    // Defer until hydration; StrictMode cleanup cancels the first scheduled frame.
    const frame = requestAnimationFrame(() => {
      if (shownThisDocument) return
      try { if (localStorage.getItem(noticeKey) === 'seen') return } catch { /* Document-only fallback. */ }
      shownThisDocument = true
      try { localStorage.setItem(noticeKey, 'seen') } catch { /* Never infer consent from this marker. */ }
      setNotice('visible')
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  useEffect(() => {
    if (notice === 'hidden' || paused) return
    const timer = setTimeout(() => setNotice(notice === 'visible' ? 'leaving' : 'hidden'), notice === 'visible' ? 5000 : 220)
    return () => clearTimeout(timer)
  }, [notice, paused])
  useEffect(() => {
    if (notice !== 'visible' || !settings.current) return
    // Do not cover the persistent footer control when visitors scroll to it.
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setNotice('hidden')
    })
    observer.observe(settings.current)
    return () => observer.disconnect()
  }, [notice])
  const dismiss = () => {
    if (toast.current?.contains(document.activeElement)) settings.current?.focus()
    setNotice('hidden')
  }
  const open = () => {
    if (checkbox.current) checkbox.current.checked = consent === 'accepted'
    setNotice('hidden')
    dialog.current?.showModal()
  }
  const choose = (allowed: boolean) => { dialog.current?.close(); setConsent(allowed) }
  return <>
    <button ref={settings} className="privacy-settings-link" type="button" onClick={open}>Privacy Settings</button>
    {notice !== 'hidden' && <aside ref={toast} className={`privacy-toast ${notice === 'leaving' ? 'is-leaving' : ''}`} aria-label="Analytics privacy notice"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }}>
      <p>We use analytics to improve our website. <button type="button" className="privacy-toast-link" onClick={open}>Privacy settings.</button></p>
      <button type="button" className="privacy-toast-close" aria-label="Dismiss privacy notice" onClick={dismiss}>×</button>
    </aside>}
    <dialog ref={dialog} className="analytics-dialog" aria-labelledby="analytics-preferences-title" onClose={() => settings.current?.focus()}>
      <h2 id="analytics-preferences-title">Privacy Settings</h2>
      <p>Optional analytics stays off until you enable it. Displaying or dismissing the notice does not give consent. Advertising tracking is not enabled.</p>
      {gpc && <p role="status">Your browser’s Global Privacy Control signal keeps optional analytics off.</p>}
      <label><input ref={checkbox} type="checkbox" disabled={gpc} /> Allow optional Google Analytics</label>
      <p>Acceptance lasts up to 180 days. Opt-outs remain until you change them or clear browser storage. We measure page visits and general contact actions, not form contents.</p>
      <p>Turning analytics off after it loads reloads this page; save any unfinished form first. <a href="/privacy-policy">Privacy information</a></p>
      <div className="analytics-actions"><button className="button" onClick={() => choose(checkbox.current?.checked ?? false)}>Save preferences</button><button className="button" onClick={() => choose(false)}>Reject analytics</button><button className="button" onClick={() => dialog.current?.close()}>Cancel</button></div>
    </dialog>
  </>
}
