import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { metadataFor, siteOrigin, socialImage, structuredData } from '../data/seo'

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
    for (const [property, content] of Object.entries({ 'og:type': 'website', 'og:site_name': 'Rapid Pack N Ship', 'og:title': document.title, 'og:description': page?.description ?? 'The requested page could not be found.', 'og:image': socialImage, 'og:image:alt': 'Rapid Pack N Ship logo', 'og:url': page ? siteOrigin + page.path : '' })) {
      let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      if (!element) { element = document.createElement('meta'); element.setAttribute('property', property); document.head.append(element) }
      element.content = content
    }
    let schema = document.getElementById('structured-data')
    if (page) {
      if (!schema) { schema = document.createElement('script'); schema.id = 'structured-data'; schema.setAttribute('type', 'application/ld+json'); document.head.append(schema) }
      schema.textContent = JSON.stringify(structuredData(page))
    } else schema?.remove()
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

