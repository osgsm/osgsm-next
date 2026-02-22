'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

export function GiscusComments() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const { resolvedTheme } = useTheme()

  if (!mounted) {
    return null
  }

  return (
    <Giscus
      repo="osgsm/osgsm-next"
      repoId="R_kgDORT5ZgQ"
      category="General"
      categoryId="DIC_kwDORT5Zgc4C29yQ"
      mapping="title"
      strict="0"
      reactionsEnabled="0"
      emitMetadata="0"
      inputPosition="bottom"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      lang="ja"
      loading="lazy"
    />
  )
}
