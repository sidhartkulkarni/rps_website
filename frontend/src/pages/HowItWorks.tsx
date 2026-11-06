import { Trophy, PackageOpen, Truck } from 'lucide-react'
import PageBanner from '../components/PageBanner'
import { cms } from '../data/content'
import Content from '../components/Content'
import ContentNotice from '../components/ContentNotice'

// Verified active CMS records 16–18.
const steps = [{ title: 'You Win It', icon: Trophy }, { title: 'We Pack It', icon: PackageOpen }, { title: 'We Ship It', icon: Truck }]
const videos = [
  { language: 'English', lang: 'en', path: '/uploads/cms/Rapid_and_ship_Video_Animation_Final_-_English.mp4' },
  { language: 'Español', lang: 'es', path: '/uploads/cms/Rapid_and_ship_Video_Animation_Spanish_Final.mp4' },
]
export default function HowItWorks() {
  return <><PageBanner title="How It Works" /><section className="section"><div className="container"><ol className="process-grid">{steps.map((step, index) => <li key={step.title}><step.icon size={42} aria-hidden="true" /><span className="process-number">{index + 1}</span><h2>{step.title}</h2><Content blocks={cms[index + 16].body} /></li>)}</ol></div></section><section className="section muted-section"><div className="container"><h2>Watch How It Works</h2><div className="two-column page-grid">{videos.map(video => <div key={video.lang}><h3 id={`video-${video.lang}`} lang={video.lang}>{video.language}</h3><video controls preload="none" playsInline aria-labelledby={`video-${video.lang}`} poster="/front_assets/images/poster-vid-imge.png"><source src={video.path} type="video/mp4" />Your browser does not support this video.</video><a className="text-link" href={video.path}>Open {video.language} video</a></div>)}</div><ContentNotice>Captions and transcripts are not available yet.</ContentNotice></div></section></>
}
