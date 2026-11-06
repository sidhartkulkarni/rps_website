import PublicImage from '../components/PublicImage'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { banner, cms, benefits } from '../data/content'
import { services } from '../data/services'
import Content from '../components/Content'
import ContactSection from '../components/ContactSection'
import ServiceCard from '../components/ServiceCard'
export default function Home() {
  return <>
    <section className="hero" style={{ backgroundImage: 'linear-gradient(90deg,rgba(15,18,19,.9),rgba(15,18,19,.67) 55%,rgba(15,18,19,.22)),url("/uploads/banner/banner176365794843176401742164.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="container hero-inner"><div className="hero-copy"><p className="eyebrow">{banner.eyebrow}</p><h1>Fast, Reliable Auction Packaging and Shipping Services <span>Because Time Is Money</span></h1><p className="hero-description">{banner.description}</p><div className="hero-actions"><Link to="/contact-us" className="button">Get A Free Quote <span className="availability">Contact us</span><ArrowRight size={18} /></Link><Link to="/#how-it-works" className="button button-outline">See How It Works <ArrowRight size={18} /></Link></div></div><PublicImage className="hero-seal" src="/front_assets/images/logo-seal.png" alt="No Late Pickup Fees — Guaranteed" width="180" height="180" /></div></section>
    <section id="about" className="section"><div className="container editorial-row image-first"><div><p className="eyebrow">{cms[3].name}</p><h2>{cms[3].title}</h2><Content blocks={cms[3].body} /><Link to="/about-us" className="text-link">About Us <ArrowRight size={18} /></Link></div><PublicImage src={cms[3].image} alt="Delivery team preparing boxes for shipment" loading="lazy" /></div></section>
    <section className="section muted-section"><div className="container"><p className="eyebrow">{cms[23].name}</p><h2>A service built around auction buyers</h2><div className="benefits-grid page-grid">{benefits.map(benefit => <article key={benefit.id}><PublicImage src={benefit.image} alt="" width="64" height="64" loading="lazy" /><h3>{benefit.title}</h3><Content blocks={benefit.body} /></article>)}</div></div></section>
    <section id="services" className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">{cms[4].name}</p><h2>{cms[4].title || cms[13].title}</h2></div><Link to="/services" className="text-link">All services <ArrowRight size={18} /></Link></div><div className="service-grid">{services.map(service => <ServiceCard key={service.slug} service={service} />)}</div></div></section>
    <section className="section muted-section"><div className="container editorial-row"><div><p className="eyebrow">{cms[5].name}</p><h2>{cms[5].title}</h2><Content blocks={cms[5].body} /><Link to="/how-it-works" className="text-link">See how it works</Link></div><PublicImage src={cms[5].image} alt="A parcel being carefully packed" loading="lazy" /></div></section>
    <section id="how-it-works" className="section" tabIndex={-1}><div className="container"><div className="centered-heading"><p className="eyebrow">{cms[15].name}</p><h2>You win, we pack, we ship.</h2></div><ol className="steps">{[16,17,18].map((id,index) => <li key={id}><div className="step-top"><span>0{index+1}</span></div><h3>{cms[id].name}</h3><Content blocks={cms[id].body} /></li>)}</ol><Link className="text-link" to="/how-it-works">Watch in English or Español <ArrowRight size={18} /></Link></div></section><ContactSection />
  </>
}
