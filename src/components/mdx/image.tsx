'use client'

import type { ImageProps } from 'next/image'
import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/cn'

interface MDXImageProps extends ImageProps {
  className?: string
  alt: string
  caption?: string
}

export default function MDXImage({
  className,
  caption,
  alt,
  ...props
}: MDXImageProps) {
  const [isImageLoading, setImageLoading] = useState(true)
  const href = props.src.toString()

  return (
    <a
      className="my-7 flex cursor-pointer flex-col justify-end gap-2 hover:opacity-90"
      href={href}
      target={href.startsWith('/') ? '_self' : '_blank'}
      rel={href.startsWith('/') ? undefined : 'noopener noreferrer'}
    >
      <div
        className={cn(
          'relative max-h-120 w-fit border border-border',
          className
        )}
      >
        <Image
          unoptimized
          alt={alt}
          width={1000}
          height={1000}
          sizes="100vw"
          style={{
            objectFit: 'contain',
            width: '100%',
            height: 'auto',
            objectPosition: 'center',
            filter: isImageLoading ? 'blur(8px)' : 'none',
            transition: 'filter 0.5s ease',
          }}
          onLoad={() => setImageLoading(false)}
          {...props}
        />
      </div>
      {caption && (
        <sub className="pt-0 pb-4 text-center text-gray-500">{caption}</sub>
      )}
    </a>
  )
}
