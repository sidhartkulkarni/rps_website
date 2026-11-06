import { innerBanners } from '../data/content'
import { Link } from 'react-router-dom'

export default function PageBanner({ title, imageKey = title }: { title: string; imageKey?: string }) {
  return <section className="page-banner" style={innerBanners[imageKey] ? { backgroundImage: `linear-gradient(90deg, #111d, #1119), url("${innerBanners[imageKey]}")` } : undefined}><div className="container"><nav aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true"> / </span>{imageKey === "Service Detail" && <><Link to="/services">Services</Link><span aria-hidden="true"> / </span></>}<span aria-current="page">{title}</span></nav><h1>{title}</h1></div></section>
}
