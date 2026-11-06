import SubmissionForm from '../components/SubmissionForm'
import { cms } from '../data/content'
import Content from '../components/Content'
import PageBanner from '../components/PageBanner'

export default function Contact() {
  return <><PageBanner title="Contact Us" /><section className="section"><div className="container contact-page"><div><p className="eyebrow">Contact Us</p><h2>{cms[19].title}</h2><Content blocks={cms[19].body} /><dl className="contact-details"><dt>Website</dt><dd>rapidpacknship.com</dd><dt>Phone</dt><dd><a href="tel:+14697324444">469-732-4444</a></dd><dt>Email</dt><dd><a href="mailto:sales@rapidpacknship.com">sales@rapidpacknship.com</a></dd></dl><h3>Business Hours</h3><p>Monday to Friday, 9:00 AM to 5:00 PM Central Time</p><p>Online quotes and shipment tracking are not available on this website yet.</p></div><SubmissionForm kind="contact" /></div></section></>
}
