'use client'

import { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Copy, Check } from 'lucide-react'

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
      className={twMerge(
        'rehype-pretty-copy',
        'absolute top-2 right-2 grid size-8 cursor-pointer place-items-center rounded-full border border-border bg-iris-3/75 font-pixel-square leading-none font-bold backdrop-blur-sm',
        '*:col-span-full *:row-span-full'
      )}
    >
      <span
        className={twMerge(
          'text-iris-10 transition-all duration-200 ease-out',

          copied ? 'invisible opacity-0' : 'visible opacity-100'
        )}
      >
        <Copy size={15} />
      </span>
      <span
        className={twMerge(
          'text-teal-8',
          'transition-all duration-200 ease-out',

          copied ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <Check size={15} />
      </span>
    </button>
  )
}
