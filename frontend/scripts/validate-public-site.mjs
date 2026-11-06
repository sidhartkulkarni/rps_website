import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const { pageMetadata, routeAliases, siteOrigin } = await server.ssrLoadModule('/src/data/seo.ts')
  const { services } = await server.ssrLoadModule('/src/data/services.ts')
  const { packaging, testimonials, cms } = await server.ssrLoadModule('/src/data/content.ts')
  const assets = new Set(JSON.parse(readFileSync('public-assets.json','utf8')))
  assert.equal(services.length,4);assert.equal(packaging.length,6);assert.equal(testimonials.length,4)
  assert.deepEqual(testimonials.map(item=>[item.name,item.rating]),[['David M.',4],['Isabelle R.',5],['John W.',4],['Laura M.',5]])
  assert(cms[8].body.some(block=>block.kind==='item'))
  const pages = {'/':'Home','/about-us':'About','/services':'Services','/reviews':'Reviews','/how-it-works':'HowItWorks','/contact-us':'Contact','/terms-and-conditions':'Legal','/privacy-policy':'Legal'}
  const Layout=(await server.ssrLoadModule('/src/components/SiteLayout.tsx')).default
  const hrefs=new Set()
  for (const meta of pageMetadata) {
    const detail=meta.path.startsWith('/service-detail/')
    const Page=(await server.ssrLoadModule(`/src/pages/${detail?'ServiceDetail':pages[meta.path]}.tsx`)).default
    const element=React.createElement(Page,pages[meta.path]==='Legal'?{title:meta.title}:{})
    const tree=React.createElement(MemoryRouter,{initialEntries:[meta.path]},React.createElement(Routes,null,React.createElement(Route,{element:React.createElement(Layout)},React.createElement(Route,{path:detail?'/service-detail/:slug':meta.path,element}))))
    const markup=renderToStaticMarkup(tree)
    assert.equal((markup.match(/<h1(?:\s|>)/g)??[]).length,1,meta.path+' must have one h1')
    assert(!/Lorem Ipsum|Change all of this|Add the asterisk|Full step details are being restored/.test(markup),meta.path+' contains editorial filler')
    for(const m of markup.matchAll(/(?:src|poster)="([^"]+)"/g)) assert(assets.has(m[1]),'Unapproved media '+m[1])
    for(const m of markup.matchAll(/href="([^"]+)"/g)) hrefs.add(m[1])
    for(const m of markup.matchAll(/<img\b[^>]*>/g)) assert(/\balt=/.test(m[0]),'Image missing alt')
    if(meta.path==='/contact-us') {
      assert(markup.includes('Send Inquiry'))
      assert(markup.includes('aria-live="polite"'))
      for(const id of ['inquiry-name','contact-email','inquiry-subject','inquiry-message']) assert(markup.includes(`for="${id}"`))
    }
    const html=readFileSync(resolve('dist',meta.path.slice(1),'index.html'),'utf8')
    assert(html.includes(`href="${siteOrigin}${meta.path}"`),'Missing static canonical')
    assert(html.includes(meta.indexable?'index,follow':'noindex,follow'),'Wrong index policy')
  }
  assert.equal(pageMetadata.length,12)
  for(const [alias,canonical] of Object.entries(routeAliases)) {
    const html=readFileSync(resolve('dist',alias.slice(1),'index.html'),'utf8')
    assert(html.includes(`href="${siteOrigin}${canonical}"`),'Alias missing canonical')
  }
  const valid=new Set([...pageMetadata.map(page=>page.path),...Object.keys(routeAliases)])
  for(const href of hrefs) if(href.startsWith('/')) {
    const path=href.split('#')[0]
    assert(valid.has(path)||assets.has(path),'Unresolved link '+href)
  }
  const walk=(path)=>readdirSync(path,{withFileTypes:true}).flatMap(item=>item.isDirectory()?walk(`${path}/${item.name}`):[`${path}/${item.name}`])
  for(const path of assets) assert(existsSync('dist'+path),'Missing build media '+path)
  for(const file of walk('dist')) {
    assert(!/\.(?:php|sql|zip|pem|crt)$/i.test(file),'Unsafe output file')
    assert(!/\/(?:global|dashboard|product|signup|user)\//.test(file),'Unapproved output directory')
    if(file.startsWith('dist/uploads/')||file.startsWith('dist/front_assets/')) assert(assets.has(file.slice(4)))
  }
  const sitemap=readFileSync('dist/sitemap.xml','utf8')
  assert.equal((sitemap.match(/<loc>/g)??[]).length,pageMetadata.filter(page=>page.indexable).length)
  console.log(`PASS: ${pageMetadata.length} rendered routes, ${services.length} detail records, internal links, headings, alt text, labels, static SEO, ${assets.size} approved assets, and output isolation.`)
} finally { await server.close() }

if(process.argv.includes('--http')) {
  const http = await createServer({server:{host:'127.0.0.1',port:0,hmr:false,ws:false}})
  try {
    await http.listen()
    const address=http.httpServer.address()
    assert(address && typeof address==='object')
    const base=`http://127.0.0.1:${address.port}`
    const paths=['/global/plugins/dropzone/upload.php','/uploads/product/unapproved.png','/public/uploads/logo/footer176401707186.png','/views/About_us/index.php','/front_assets/js/unapproved.js']
    for(const path of paths) {const response=await fetch(base+path);assert.equal(response.status,404,path)}
    const media='/uploads/logo/footer176401707186.png'
    const response=await fetch(base+media);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');await response.arrayBuffer()
    const video='/uploads/cms/Rapid_and_ship_Video_Animation_Final_-_English.mp4'
    const range=await fetch(base+video,{headers:{Range:'bytes=0-31'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,32)
    const invalid=await fetch(base+video,{headers:{Range:'bytes=9999999999-'}});assert.equal(invalid.status,416)
    const direct=await fetch(base+'/@fs/'+resolve('public'+media));assert.equal(direct.status,403)
    console.log('PASS: dev-server media isolation, direct filesystem denial, and video byte-range handling.')
  } finally {await http.close()}
}
