import type { Metadata } from 'next'
import FlowFieldLoader from './flow-field-loader'

export const metadata: Metadata = {
  title: 'Curl Noise Flow Field',
  openGraph: {
    images: [
      {
        url: 'https://osgsm.io/playground/flow-field.png',
        width: 800,
        height: 450,
      },
    ],
  },
}

export default function FlowFieldPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <FlowFieldLoader />
    </div>
  )
}
