import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout'
import Legal from './pages/Legal'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Reviews from './pages/Reviews'
import HowItWorks from './pages/HowItWorks'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import './App.css'
import './pages.css'

export default function App() {
  return <BrowserRouter><Routes><Route element={<SiteLayout />}><Route index element={<Home />} /><Route path="about-us" element={<About />} /><Route path="about" element={<Navigate to="/about-us" replace />} /><Route path="services" element={<Services />} /><Route path="service-detail/:slug" element={<ServiceDetail />} /><Route path="reviews" element={<Reviews />} /><Route path="how-it-works" element={<HowItWorks />} /><Route path="contact-us" element={<Contact />} /><Route path="contact" element={<Navigate to="/contact-us" replace />} /><Route path="how-it-work" element={<Navigate to="/how-it-works" replace />} /><Route path="terms-conditions" element={<Navigate to="/terms-and-conditions" replace />} /><Route path="terms-and-conditions" element={<Legal title="Terms of Use" />} /><Route path="privacy-policy" element={<Legal title="Privacy Policy" />} /><Route path="*" element={<NotFound />} /></Route></Routes></BrowserRouter>
}
