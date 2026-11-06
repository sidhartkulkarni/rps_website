import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { createReadStream, copyFileSync, mkdirSync, statSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pageMetadata, siteOrigin, routeAliases } from './src/data/seo.ts'

const root = dirname(fileURLToPath(import.meta.url))
const assets = new Set<string>(JSON.parse(readFileSync(resolve(root, 'public-assets.json'), 'utf8')))
const mime: Record<string,string> = {'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageMetadata.filter(page=>page.indexable).map(page=>`<url><loc>${siteOrigin}${page.path}</loc></url>`).join('')}</urlset>`
const robots = `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`
function safeAssets(): Plugin {
  return {
    name: 'verified-public-assets',
    buildStart() {
      for (const path of assets) {
        const file = resolve(root, 'public', path.slice(1))
        if (!path.startsWith('/') || path.includes('..') || !mime[extname(path)] || !realpathSync(file).startsWith(resolve(root,'public')+'/')) throw new Error('Invalid approved media path')
      }
    },
    configureServer(server) {
      server.middlewares.use((req,res,next)=> {
        let path: string
        try { path = decodeURIComponent((req.url ?? '/').split('?')[0]) } catch { res.statusCode=400;res.end();return }
        if (path==='/sitemap.xml' || path==='/robots.txt') {res.setHeader('Content-Type',path.endsWith('.xml')?'application/xml':'text/plain');res.end(path.endsWith('.xml')?sitemap:robots);return}
        if (!assets.has(path)) {
          if (/^\/(?:public|views|uploads|front_assets|global|dashboard)(?:\/|$)/.test(path)) {res.statusCode=404;res.end();return}
          next();return
        }
        if (req.method!=='GET' && req.method!=='HEAD') {res.statusCode=405;res.end();return}
        const file=resolve(root,'public',path.slice(1));const size=statSync(file).size
        res.setHeader('Content-Type',mime[extname(file)]);res.setHeader('Accept-Ranges','bytes');res.setHeader('X-Content-Type-Options','nosniff')
        let start=0,end=size-1
        if(req.headers.range) {
          const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range)
          if(!match || (!match[1] && !match[2])) {res.statusCode=416;res.setHeader('Content-Range',`bytes */${size}`);res.end();return}
          if(match[1]) {start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1}
          else start=Math.max(0,size-Number(match[2]))
          if(start>end || start>=size) {res.statusCode=416;res.setHeader('Content-Range',`bytes */${size}`);res.end();return}
          res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`)
        }
        res.setHeader('Content-Length',end-start+1)
        if(req.method==='HEAD') {res.end();return}
        const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res)
      })
    },
    generateBundle() {
      this.emitFile({type:'asset',fileName:'sitemap.xml',source:sitemap})
      this.emitFile({type:'asset',fileName:'robots.txt',source:robots})
    },
    writeBundle(options) {
      const out=options.dir ?? resolve(root,'dist')
      for (const path of assets) { const dest=resolve(out,path.slice(1));mkdirSync(dirname(dest),{recursive:true});copyFileSync(resolve(root,'public',path.slice(1)),dest) }
      const template = readFileSync(resolve(out,'index.html'),'utf8')
      const escape = (text: string) => text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      for (const page of pageMetadata) {
        const paths = [page.path, ...Object.keys(routeAliases).filter(alias=>routeAliases[alias]===page.path)]
        for (const path of paths) {
          const markup=template.replace(/<title>.*?<\/title>/s,`<title>${escape(page.title)} | Rapid Pack N Ship</title>`)
            .replace(/<meta name="description" content="[^"]*" \/>/,`<meta name="description" content="${escape(page.description)}" />`)
            .replace('</head>',`<link rel="canonical" href="${siteOrigin}${page.path}" /><meta name="robots" content="${page.indexable?'index,follow':'noindex,follow'}" /></head>`)
          const dest=resolve(out,path.slice(1),'index.html');mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,markup)
        }
      }
    },
  }
}
export default defineConfig({
  publicDir: false,
  build: { sourcemap: false, emptyOutDir: true },
  plugins: [react(), safeAssets()],
  server: { proxy: { '/api/website': 'http://127.0.0.1:8001' }, fs: { deny: ['.env','.env.*','*.{crt,pem}','**/.git/**','**/public/**','**/views/**','**/local-private-assets/**','**/*.sql','**/*.php'] } },
})
