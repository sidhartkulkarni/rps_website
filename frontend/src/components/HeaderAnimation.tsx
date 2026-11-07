import { useState, useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
function subscribe(onChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

// Recovered custom.css header-ani/header-box: original mascot and 2.5s/2.9s timing.
export default function HeaderAnimation() {
  const reducedMotion = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  if (reducedMotion || finished) return null
  return <div aria-hidden="true" className={`header-intro${running ? ' is-running' : ''}`} onAnimationEnd={event => {
    if (event.animationName === 'rps-header-reveal') setFinished(true)
  }}>
    <span className="header-intro-cover" />
    <img className="header-intro-mascot" src="/front_assets/images/header-vid.gif" alt="" width="100" height="100" onLoad={() => setRunning(true)} onError={() => setFinished(true)} />
  </div>
}
