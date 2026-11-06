import { services } from './services.ts'
import { banner, cms } from './content.ts'

// Domain recovered from the public Contact template. HTTPS is the target canonical scheme.
export const siteOrigin = 'https://rapidpacknship.com'
export interface PageMetadata { path: string; title: string; description: string; indexable: boolean }
const description = (id: number) => cms[id].body.find(block => block.kind === 'paragraph')?.text ?? ''
export const pageMetadata: PageMetadata[] = [
  {path:'/',title:'Home',description:banner.description,indexable:true},
  {path:'/about-us',title:'About Us',description:description(8),indexable:true},
  {path:'/services',title:'Services',description:'Reliable Shipping Solutions. Complete Auction Shipping and Packaging Solutions.',indexable:true},
  ...services.map(service => ({path:`/service-detail/${service.slug}`,title:service.name,description:service.summary,indexable:true})),
  {path:'/reviews',title:'Reviews',description:cms[14].title,indexable:false},
  {path:'/how-it-works',title:'How It Works',description:[16,17,18].map(id=>cms[id].name).join('. '),indexable:true},
  {path:'/contact-us',title:'Contact Us',description:description(19),indexable:true},
  {path:'/terms-and-conditions',title:'Terms of Use',description:'Terms of Use — content awaiting approval.',indexable:false},
  {path:'/privacy-policy',title:'Privacy Policy',description:'Privacy Policy — content awaiting approval.',indexable:false},
]
export const routeAliases: Record<string,string> = {'/about':'/about-us','/contact':'/contact-us','/how-it-work':'/how-it-works','/terms-conditions':'/terms-and-conditions'}
export function metadataFor(path: string) {
  const normalized = path === '/' ? path : path.replace(/\/+$/, '')
  return pageMetadata.find(page => page.path === (routeAliases[normalized] ?? normalized))
}
