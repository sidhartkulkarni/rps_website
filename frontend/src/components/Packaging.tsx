import { cms, packaging } from '../data/content'
import Content from './Content'

export default function Packaging() {
  return <section className="section muted-section"><div className="container"><h2>{cms[22].name}</h2><div className="service-grid page-grid">{packaging.map(category => <article className="packaging-card" key={category.id}><h3>{category.title}</h3><Content blocks={category.body} />{category.extra.length > 0 && <details><summary>Read more<span className="sr-only"> about {category.title}</span></summary><Content blocks={category.extra} /></details>}</article>)}</div></div></section>
}
