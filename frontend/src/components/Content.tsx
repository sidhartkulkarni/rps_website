import type { ContentBlock } from '../data/content'

// Render text nodes only: no raw HTML, scripts, styles, or arbitrary CMS links.
export default function Content({ blocks }: { blocks: ContentBlock[] }) {
  const groups: ContentBlock[][] = []
  for (const block of blocks) {
    const last = groups.at(-1)
    if (block.kind === 'item' && last?.[0]?.kind === 'item') last.push(block)
    else groups.push([block])
  }
  return <div className="cms-content">{groups.map((group, index) => group[0].kind === 'item'
    ? <ul key={index}>{group.map((block, i) => <li key={i}>{block.text}</li>)}</ul>
    : <p key={index}>{group[0].text}</p>)}</div>
}
