import HeaderAnimation from './HeaderAnimation'
import { businessPhone } from '../data/site'
import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { logo, navigation } from '../data/site'

export default function Header() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  return <header className="site-header" onKeyDown={event => {
    if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus() }
  }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }}>
    <HeaderAnimation />
    <div className="container header-inner">
      <Link to="/" aria-label="Rapid Pack N Ship home" onClick={() => setOpen(false)}><img className="header-logo" width="305" height="95" src={logo} alt="Rapid Pack N Ship" /></Link>
      <button type="button" ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav id="main-navigation" aria-label="Main navigation" className={open ? 'navigation is-open' : 'navigation'}>
        {navigation.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}
      </nav>
    </div>
    <p className="preview-notice">For quotes or urgent assistance, contact our team. Call <a href={businessPhone.href}>{businessPhone.display}</a> or email <a href="mailto:sales@rapidpacknship.com">sales@rapidpacknship.com</a>.</p>
  </header>
}

