import { Link, useParams } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import Content from '../components/Content'
import NotFound from './NotFound'
import { services } from '../data/services'
export default function ServiceDetail() {
  const { slug } = useParams()
  const service = services.find(item => item.slug === slug)
  if (!service) return <NotFound />
  return <><PageBanner title={service.name} imageKey="Service Detail" /><section className="section"><div className="container"><div className="editorial-row image-first"><div><h2>{service.name}</h2><Content blocks={service.description} /><Link className="button" to="/contact-us">Contact us about this service</Link></div><img src={service.image} alt={service.imageAlt} /></div><Link className="text-link" to="/services">Back to Services</Link></div></section></>
}
