import { useRef, useState } from 'react'
import type { FormEvent } from 'react'

export default function SubmissionForm({ kind }: { kind: 'contact' | 'newsletter' }) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [failed, setFailed] = useState(false)
  const lock = useRef(false)
  const attempt = useRef<{ body: string; key: string } | null>(null)
  const contact = kind === 'contact'
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setStatus('Sending…')
    setFailed(false)
    const form = event.currentTarget
    const fields = new FormData(form)
    const payload = contact
      ? { name: fields.get('name'), email: fields.get('email'), subject: fields.get('subject'), message: fields.get('message'), website: fields.get('website') }
      : { email: fields.get('email'), consent: fields.get('consent') === 'on', website: fields.get('website') }
    const body = JSON.stringify(payload)
    if (!attempt.current || attempt.current.body !== body) attempt.current = { body, key: crypto.randomUUID() }
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 60000)
    try {
      const response = await fetch(`/api/website/${kind}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.current.key },
        body, signal: controller.signal, credentials: 'omit',
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.status !== 'delivered') {
        const messages: Record<number, string> = {
          400: 'Please reload the page and try again.',
          409: 'This submission conflicts with an earlier attempt. Please contact us directly.',
          422: 'Please check all required fields and your email address.',
          429: 'Too many attempts. Please wait before trying again.',
        }
        throw new Error(messages[response.status] || 'Delivery could not be confirmed. Please contact us directly before making another submission.')
      }
      setStatus(contact ? 'Your inquiry was accepted by our email provider.' : 'Your subscription request was sent. Enrollment requires confirmation.')
      form.reset()
      attempt.current = null
    } catch (error) {
      setFailed(true)
      setStatus(error instanceof Error && error.name !== 'AbortError' && error.name !== 'TypeError' ? error.message : 'Delivery could not be confirmed. Please contact us directly before resubmitting.')
    } finally {
      window.clearTimeout(timeout)
      lock.current = false
      setBusy(false)
    }
  }
  return <form className={contact ? 'contact-form' : 'newsletter-form'} onSubmit={submit} aria-describedby={`${kind}-notice`} aria-busy={busy}>
    <h2>{contact ? 'Send an Inquiry' : 'Newsletter'}</h2>
    <p id={`${kind}-notice`}>{contact ? 'Send a general inquiry. Do not include payment information or sensitive documents.' : 'Request email updates. Your subscription is not active until confirmed.'}</p>
    <fieldset disabled={busy}><legend className="sr-only">{contact ? 'Contact inquiry' : 'Newsletter request'}</legend>
      <div className={contact ? 'two-column' : undefined}>
      {contact && <label htmlFor="inquiry-name">Name (required)<input id="inquiry-name" name="name" autoComplete="name" required maxLength={100} /></label>}
      <label htmlFor={`${kind}-email`}>Email (required)<input id={`${kind}-email`} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      </div>
      {contact && <><label htmlFor="inquiry-subject">Subject (required)<input id="inquiry-subject" name="subject" required maxLength={200} /></label><label htmlFor="inquiry-message">Message (required)<textarea id="inquiry-message" name="message" rows={6} required maxLength={5000} /></label></>}
      {!contact && <label className="newsletter-consent"><input type="checkbox" name="consent" required /> I would like to receive newsletter emails.</label>}
      <div className="submission-trap" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="button" type="submit">{busy ? 'Sending…' : contact ? 'Send Inquiry' : 'Request Subscription'}</button>
    </fieldset>
    <p role="status" aria-live="polite" className={failed ? 'submission-error' : 'submission-status'}>{status}</p>
  </form>
}
