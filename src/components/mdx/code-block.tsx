'use client'

import React, { useRef } from 'react'

import { CopyButton } from './copy-button'

export function CodeBlock({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null)

  return (
    <figure ref={ref} {...props} className="group my-[1.75em]">
      {children}
      <CopyButton
        getCodeAction={() =>
          ref.current?.querySelector('code')?.textContent ?? ''
        }
      />
    </figure>
  )
}
