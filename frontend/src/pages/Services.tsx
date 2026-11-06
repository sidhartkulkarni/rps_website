import { Link } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import ServiceCard from '../components/ServiceCard'
import Packaging from '../components/Packaging'
import { services } from '../data/services'
import { cms } from '../data/content'
export default function Services() {
  return <><PageBanner title="Services" /><section className="section"><div className="container"><p className="eyebrow">{cms[13].name}</p><h2>{cms[13].title}</h2><div className="service-grid page-grid">{services.map(service => <ServiceCard key={service.slug} service={service} />)}</div></div></section><Packaging /><section className="section"><div className="container"><h2>Discuss your shipment</h2><p>Tell our team about your auction purchase and packaging needs.</p><Link className="button" to="/contact-us">Contact us about packaging and shipping</Link></div></section></>
}
