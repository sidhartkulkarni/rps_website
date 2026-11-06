import PublicImage from '../components/PublicImage'
import PageBanner from '../components/PageBanner'
import Content from '../components/Content'
import { cms } from '../data/content'

const alts: Record<number, string> = {8: 'Packaging and shipping team', 9: 'Wrapped boxes on a shipping pallet', 10: 'Applying a shipping label to a parcel', 11: 'Packaging and logistics', 12: 'Shipping and customer service'}
export default function About() {
  return <><PageBanner title="About Us" />{[8,9,10,11,12].map((id,index) => <section className={`section ${index % 2 ? 'muted-section' : ''}`} key={id}><div className={`container editorial-row ${index % 2 ? 'image-first' : ''}`}><div>{cms[id].title && <p className="eyebrow">{cms[id].name}</p>}<h2>{cms[id].title || cms[id].name}</h2><Content blocks={cms[id].body} /></div><PublicImage src={cms[id].image} alt={alts[id]} loading="lazy" /></div></section>)}</>
}
