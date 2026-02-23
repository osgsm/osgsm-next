'use client'

import { useCallback, useState } from 'react'

export function CopyButton({ getCode }: { getCode: () => string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const code = getCode()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [getCode])

  return (
    <button
      type="button"
      title="Copy code"
      aria-label="Copy code"
      onClick={handleCopy}
      className="rehype-pretty-copy"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`absolute size-4 text-iris-11 transition-opacity duration-400 ${copied ? 'opacity-0' : 'opacity-100'}`}
      >
        <rect width={14} height={14} x={8} y={8} rx={2} ry={2} />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`absolute size-4 text-iris-11 transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  )
}
