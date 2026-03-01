import type React from 'react'
import { cn } from '@/lib/cn'

import styles from './preview.module.css'

const Preview = ({
  children,
  codeblock,
  dark,
}: React.HTMLAttributes<HTMLDivElement> & {
  codeblock?: string
  dark?: string
}) => (
  <div className={cn('-mx-1', styles.preview)} data-with-codeblock={codeblock}>
    <figure style={{ backgroundColor: dark ? '#13131e' : 'transparent' }}>
      {children}
    </figure>
  </div>
)

export default Preview
