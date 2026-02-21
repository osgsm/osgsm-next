'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    twttr: any
  }
}

export function TweetEmbed({ html }: { html: string }) {
  const tweetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window.twttr === 'undefined') return

    window.twttr.widgets.load(tweetRef.current)
  }, [])

  return (
    <div
      ref={tweetRef}
      className="[&_iframe]:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
