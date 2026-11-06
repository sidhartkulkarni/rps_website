import { services } from './services.ts'
import { cms } from './content.ts'

// Domain recovered from the public Contact template. HTTPS is the target canonical scheme.
export const siteOrigin = 'https://rapidpacknship.com'
export interface PageMetadata { path: string; title: string; description: string; indexable: boolean }
export const pageMetadata: PageMetadata[] = [
  {path:'/',title:'Auction Packaging & Shipping',description:'Packaging and shipping for auction purchases. Explore parcel, LTL, full truckload and intermodal shipping, or contact Rapid Pack N Ship about your shipment.',indexable:true},
  {path:'/about-us',title:'About Our Auction Shipping Team',description:'Learn about Rapid Pack N Ship, our company story and our approach to packaging and shipping auction purchases.',indexable:true},
  {path:'/services',title:'Packaging & Freight Shipping Services',description:'Explore parcel shipping, LTL freight, full truckload and intermodal global shipping, plus packaging options for auction purchases.',indexable:true},
  ...services.map(service => ({path:`/service-detail/${service.slug}`,title:service.name,description:service.summary,indexable:true})),
  {path:'/reviews',title:'Reviews',description:cms[14].title,indexable:false},
  {path:'/how-it-works',title:'How It Works',description:[16,17,18].map(id=>cms[id].name).join('. '),indexable:true},
  {path:'/contact-us',title:'Contact Us',description:'Contact Rapid Pack N Ship about auction packaging, parcel shipping or freight. Call, email or send an inquiry with your shipment requirements.',indexable:true},
  {path:'/terms-and-conditions',title:'Terms of Use',description:'Terms of Use — content awaiting approval.',indexable:false},
  {path:'/privacy-policy',title:'Privacy Policy',description:'Privacy Policy — content awaiting approval.',indexable:false},
]
export const routeAliases: Record<string,string> = {'/about':'/about-us','/contact':'/contact-us','/how-it-work':'/how-it-works','/terms-conditions':'/terms-and-conditions'}
export function metadataFor(path: string) {
  const normalized = path === '/' ? path : path.replace(/\/+$/, '')
  return pageMetadata.find(page => page.path === (routeAliases[normalized] ?? normalized))
}

export const socialImage = siteOrigin + '/uploads/logo/footer176401707186.png'
export function structuredData(page: PageMetadata) {
  const organization = { '@type': 'Organization', '@id': siteOrigin + '/#organization', name: 'Rapid Pack N Ship', url: siteOrigin + '/', logo: socialImage }
  const website = { '@type': 'WebSite', '@id': siteOrigin + '/#website', url: siteOrigin + '/', name: 'Rapid Pack N Ship', publisher: { '@id': organization['@id'] } }
  const graph: object[] = [organization, website]
  if (page.path !== '/') {
    const parents = [{ name: 'Home', item: siteOrigin + '/' }]
    if (page.path.startsWith('/service-detail/')) parents.push({ name: 'Services', item: siteOrigin + '/services' })
    parents.push({ name: page.title, item: siteOrigin + page.path })
    graph.push({ '@type': 'BreadcrumbList', itemListElement: parents.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) })
  }
  const service = services.find(item => page.path === '/service-detail/' + item.slug)
  if (service) graph.push({ '@type': 'Service', '@id': siteOrigin + page.path + '#service', name: service.name, url: siteOrigin + page.path, image: siteOrigin + service.image, provider: { '@id': organization['@id'] } })
  return { '@context': 'https://schema.org', '@graph': graph }
}
