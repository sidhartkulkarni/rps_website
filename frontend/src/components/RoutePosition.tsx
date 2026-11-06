import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { metadataFor, siteOrigin } from '../data/seo'

export default function RoutePosition() {
  const { pathname, hash } = useLocation()
  const previousLocation = useRef(pathname + hash)
  useEffect(() => {
    const page = metadataFor(pathname)
    document.title = `${page?.title ?? 'Page Not Found'} | Rapid Pack N Ship`
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
      if (!element) { element = document.createElement('meta'); element.name = name; document.head.append(element) }
      element.content = content
    }
    setMeta('description', page?.description ?? 'The requested page could not be found.')
    setMeta('robots', page?.indexable ? 'index,follow' : 'noindex,follow')
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (page) {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
      canonical.href = siteOrigin + page.path
    } else canonical?.remove()
    const target = hash ? document.getElementById(hash.slice(1)) : document.getElementById('main-content')
    if (previousLocation.current !== pathname + hash) {
      target?.focus({ preventScroll: true })
      previousLocation.current = pathname + hash
    }
    if (hash) target?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

