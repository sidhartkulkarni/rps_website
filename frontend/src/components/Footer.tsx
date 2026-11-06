import SubmissionForm from './SubmissionForm'
import { Link } from 'react-router-dom'
import { logo, navigation } from '../data/site'
import { services } from '../data/services'
import { cms } from '../data/content'
import Content from './Content'
export default function Footer() {
  return <footer className="site-footer"><div className="container footer-main"><div className="footer-brand"><Link to="/" aria-label="Rapid Pack N Ship home"><img src={logo} alt="Rapid Pack N Ship" width="305" height="95" loading="lazy" /></Link><p><a href="tel:+14697324444">469-732-4444</a><br /><a href="mailto:sales@rapidpacknship.com">sales@rapidpacknship.com</a></p></div><div><h2>Explore</h2><nav aria-label="Footer navigation">{navigation.map(([path,label]) => <Link key={path} to={path}>{label}</Link>)}<Link to="/terms-and-conditions">Terms of Use</Link><Link to="/privacy-policy">Privacy Policy</Link></nav></div><div><h2>Our Services</h2><nav className="footer-services" aria-label="Service navigation">{services.map(service => <Link key={service.slug} to={`/service-detail/${service.slug}`}>{service.name}</Link>)}</nav></div></div><div className="container footer-notes"><Content blocks={cms[7].body} /><SubmissionForm kind="newsletter" /><p>Account access is not available on this website yet.</p></div><div className="container footer-bottom">© {new Date().getFullYear()} Rapid Pack N Ship. All rights reserved.</div></footer>
}
