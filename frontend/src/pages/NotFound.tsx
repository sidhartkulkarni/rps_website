import { Link } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
export default function NotFound() {
  return <><PageBanner title="Page Not Found" /><section className="section"><div className="container"><p>This page could not be found.</p><Link className="button" to="/">Back to Home</Link></div></section></>
}
