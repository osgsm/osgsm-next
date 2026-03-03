'use client'

import { useCallback, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export function CopyButton({ getCodeAction }: { getCodeAction: () => string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      const code = getCodeAction()
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy code')
    }
  }, [getCodeAction])

  return (
    <button
      type="button"
      title="Copy code"
      aria-label="Copy code"
      onClick={handleCopy}
      className={cn(
        'rehype-pretty-copy',
        'absolute top-2 right-2 grid size-8 cursor-pointer place-items-center overflow-clip rounded-full border border-border bg-iris-2 font-pixel-square leading-none font-bold',
        '*:col-span-full *:row-span-full'
      )}
    >
      <span
        className={cn(
          'grid size-full place-items-center bg-iris-2 text-iris-10'
        )}
      >
        <Copy
          className={cn(
            'size-3.5',
            'transition-all duration-400 ease-out',
            copied ? 'invisible opacity-0' : 'visible opacity-100 delay-150'
          )}
        />
      </span>
      <span
        className={cn(
          'grid size-full place-items-center text-teal-8',
          'transition-opacity ease-out',
          copied ? 'visible opacity-100 delay-150' : 'invisible opacity-0'
        )}
      >
        <Check className="size-3.5" />
      </span>
    </button>
  )
}
