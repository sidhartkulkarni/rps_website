import PageBanner from '../components/PageBanner'
import ContentNotice from '../components/ContentNotice'
export default function Legal({ title }: { title: 'Privacy Policy' | 'Terms of Use' }) {
  return <><PageBanner title={title} /><section className="section"><div className="container"><ContentNotice>{title} content is not available yet. Please contact sales@rapidpacknship.com with questions.</ContentNotice></div></section></>
}
