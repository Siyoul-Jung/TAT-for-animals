'use client'

import dynamic from 'next/dynamic'
import config from '../../../../sanity.config'

const Studio = dynamic(
  () => import('next-sanity/studio').then((m) => m.NextStudio),
  { ssr: false }
)

export default function StudioPage() {
  return <Studio config={config} />
}
