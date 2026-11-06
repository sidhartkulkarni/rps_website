"""Self-contained consent pages work with the unchanged production React release."""
import base64
import hashlib
from fastapi.responses import HTMLResponse

SCRIPT = '''
const form = document.querySelector('form');
const button = document.querySelector('button');
const status = document.getElementById('status');
const token = new URLSearchParams(location.hash.slice(1)).get('token');
history.replaceState(null, '', location.pathname);
if (!token) { status.textContent = 'Open the complete link from your email.'; }
else { button.disabled = false; }
form.addEventListener('submit', async event => {
  event.preventDefault(); button.disabled = true; status.textContent = 'Processing…';
  try {
    const response = await fetch(location.pathname, {method:'POST', credentials:'omit', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token})});
    const data = await response.json();
    status.textContent = response.ok ? data.message : (data.detail || 'Unable to process this link. Please try later.');
    if (!response.ok && response.status >= 500) button.disabled = false;
  } catch { status.textContent = 'Unable to confirm the result. You can safely retry this action.'; button.disabled = false; }
});
'''


def landing(kind):
    confirm = kind == 'confirm'
    title = 'Confirm your subscription' if confirm else 'Unsubscribe from the newsletter'
    text = 'Select Confirm to receive Rapid Pack N Ship newsletter emails.' if confirm else 'Select Unsubscribe to stop newsletter emails or cancel a pending request.'
    label = 'Confirm subscription' if confirm else 'Unsubscribe'
    digest = base64.b64encode(hashlib.sha256(SCRIPT.encode()).digest()).decode()
    html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{title} | Rapid Pack N Ship</title>
<style>body{{font:18px/1.6 system-ui,sans-serif;color:#242424;background:#f7f6f3;margin:0}}main{{max-width:560px;margin:8vh auto;padding:32px}}h1{{line-height:1.2}}button{{font:inherit;background:#b41d18;color:white;border:0;border-radius:4px;padding:14px 22px;cursor:pointer}}button:disabled{{opacity:.6;cursor:not-allowed}}:focus-visible{{outline:3px solid #168da5;outline-offset:4px}}a{{color:#901713}}#status{{min-height:3em}}</style></head><body><main><p>Rapid Pack N Ship</p><h1>{title}</h1><p>{text}</p><form><button disabled>{label}</button></form><p id="status" role="status" aria-live="polite"></p><noscript>JavaScript is required to securely process this link. Contact sales@rapidpacknship.com for assistance.</noscript><a href="/">Return to the website</a></main><script>{SCRIPT}</script></body></html>'''
    return HTMLResponse(html, headers={
        'Content-Security-Policy': f"default-src 'none'; script-src 'sha256-{digest}'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
        'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow'})
