import PageBanner from '../components/PageBanner'
import Content from '../components/Content'
import { cms, testimonials } from '../data/content'
export default function Reviews() {
  return <><PageBanner title="Reviews" /><section className="section"><div className="container"><div className="centered-heading"><p className="eyebrow">{cms[14].name}</p><h2>{cms[14].title}</h2><p>Testimonials reproduced from the previous website. Attribution is awaiting confirmation.</p></div><div className="reviews-grid">{testimonials.map(review => <figure className="review-card" key={review.id}><img src="/front_assets/images/quote.png" alt="" width="56" height="40" /><figcaption>{review.name}</figcaption><p aria-label={`${review.rating} out of 5 stars`} className="review-rating"><span aria-hidden="true">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span></p><blockquote><Content blocks={review.body} /></blockquote></figure>)}</div></div></section></>
}
