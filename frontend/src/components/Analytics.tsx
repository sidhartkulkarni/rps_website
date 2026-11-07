import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { track, trackPage } from '../analytics/tracking'
import { businessPhone } from '../data/site'
export default function Analytics() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => { trackPage() }, [pathname, search, hash])
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const anchor = event.target.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (href === businessPhone.href) track('click_to_call')
      else if (href === 'mailto:sales@rapidpacknship.com' || href === 'mailto:mark@rapidpacknship.com') track('click_email')
      else if (anchor.hasAttribute('data-analytics-cta')) track('quote_cta_click')
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [])
  return null
}
