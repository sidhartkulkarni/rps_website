import type { ReactNode } from 'react'

export default function ContentNotice({ children }: { children: ReactNode }) {
  return <div className="content-notice"><p>{children}</p></div>
}
