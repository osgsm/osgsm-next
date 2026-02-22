'use client'

import React, { useRef } from 'react'

import { CopyButton } from './copy-button'

export function CodeBlock({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null)

  return (
    <figure ref={ref} {...props} className="group">
      {children}
      <CopyButton
        getCode={() => ref.current?.querySelector('code')?.textContent ?? ''}
      />
    </figure>
  )
}
