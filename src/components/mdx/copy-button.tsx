'use client'

import { useCallback, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export function CopyButton({ getCodeAction }: { getCodeAction: () => string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const code = getCodeAction()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [getCodeAction])

  return (
    <button
      type="button"
      title="Copy code"
      aria-label="Copy code"
      onClick={handleCopy}
      className={cn(
        'rehype-pretty-copy',
        'absolute top-2 right-2 grid size-8 cursor-pointer place-items-center overflow-clip rounded-full border border-border bg-iris-2 font-pixel-square leading-none font-bold backdrop-blur-sm',
        '*:col-span-full *:row-span-full'
      )}
    >
      <span
        className={cn(
          'grid size-full place-items-center bg-iris-2 text-iris-10',
          'transition-opacity duration-400 ease-out',

          copied ? 'opacity-0' : 'opacity-100 delay-150'
        )}
      >
        <span className="size-3.5">
          <Copy className="size-full" />
        </span>
      </span>
      <span
        className={cn(
          'grid size-full place-items-center text-teal-8',
          'transition-opacity ease-out',
          copied ? 'opacity-100 delay-150' : 'opacity-0'
        )}
      >
        <Check size={15} />
      </span>
    </button>
  )
}
