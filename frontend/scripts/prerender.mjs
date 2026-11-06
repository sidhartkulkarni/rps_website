import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
try {
  const { render } = await server.ssrLoadModule('/src/entry-static.tsx')
  const { pageMetadata, routeAliases, siteOrigin, socialImage, structuredData } = await server.ssrLoadModule('/src/data/seo.ts')
  const template = readFileSync('dist/index.html','utf8')
  for (const path of [...pageMetadata.map(page=>page.path), ...Object.keys(routeAliases), '/404']) {
    const page = pageMetadata.find(page=>page.path === (routeAliases[path] ?? path))
    const title = `${page?.title ?? 'Page Not Found'} | Rapid Pack N Ship`
    const description = page?.description ?? 'The requested page could not be found.'
    const canonical = page ? siteOrigin + page.path : null
    const head = `<meta name="robots" content="${page?.indexable && !routeAliases[path] ? 'index,follow' : 'noindex,follow'}" />` +
      (canonical ? `<link rel="canonical" href="${canonical}" />` : '') +
      `<meta property="og:type" content="website" /><meta property="og:site_name" content="Rapid Pack N Ship" /><meta property="og:title" content="${escape(title)}" /><meta property="og:description" content="${escape(description)}" /><meta property="og:image" content="${socialImage}" /><meta property="og:image:alt" content="Rapid Pack N Ship logo" />` +
      (canonical ? `<meta property="og:url" content="${canonical}" />` : '') +
      (page ? `<script type="application/ld+json" id="structured-data">${JSON.stringify(structuredData(page)).replaceAll('<','\\u003c')}</script>` : '') +
      (path === '/' ? '<link rel="preload" as="image" href="/uploads/banner/banner176365794843176401742164.jpg" fetchpriority="high" />' : '')
    const html = template.replace(/<title>.*?<\/title>/s,`<title>${escape(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*" \/>/,`<meta name="description" content="${escape(description)}" />`)
      .replace('</head>',head+'</head>').replace('<div id="root"></div>',`<div id="root">${render(path)}</div>`)
    const dest = path === '/404' ? 'dist/404.html' : resolve('dist',path.slice(1),'index.html')
    mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,html)
  }
} finally { await server.close() }
