import Analytics from './Analytics'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import RoutePosition from './RoutePosition'

export default function SiteLayout() {
  return <><RoutePosition /><Analytics /><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" tabIndex={-1}><Outlet /></main><Footer /></>
}
