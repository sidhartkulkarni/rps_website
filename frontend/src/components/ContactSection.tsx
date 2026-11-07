import { businessPhone } from '../data/site'
import { Link } from 'react-router-dom'
import { cms } from '../data/content'
import Content from './Content'
export default function ContactSection() {
  return <section id="contact" className="contact-section section"><div className="container contact-layout"><div><p className="eyebrow">Get In Touch</p><h2>{cms[19].title}</h2><Content blocks={cms[19].body} /></div><div className="contact-panel"><h3>Contact Rapid Pack N Ship</h3><p><a href={businessPhone.href}>{businessPhone.display}</a><br /><a href="mailto:sales@rapidpacknship.com">sales@rapidpacknship.com</a></p><Link className="text-link" to="/contact-us" data-analytics-cta="contact">Contact Us</Link></div></div></section>
}
