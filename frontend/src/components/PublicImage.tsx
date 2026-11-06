import type { ImgHTMLAttributes } from 'react'
import dimensions from '../data/imageDimensions.json'
export default function PublicImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const size = dimensions[props.src as keyof typeof dimensions]
  return <img decoding="async" {...size} {...props} />
}
