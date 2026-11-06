import PublicImage from './PublicImage'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Service } from '../data/services'

export default function ServiceCard({ service }: { service: Service }) {
  return <article className="service-card"><PublicImage src={service.image} alt={service.imageAlt} loading="lazy" /><div><h3>{service.name}</h3><p>{service.summary}</p><Link className="text-link" to={`/service-detail/${encodeURIComponent(service.slug)}`}>Learn more <span className="sr-only">about {service.name}</span><ArrowRight size={18} /></Link></div></article>
}
