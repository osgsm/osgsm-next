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

  return (
    <figure className="-mx-1 my-7 flex cursor-pointer flex-col justify-end gap-2">
      <Image
        className={cn(
          'h-auto w-full rounded-3xl border border-border object-contain object-center transition-all',
          isImageLoading ? 'blur-sm' : 'blur-none',
          className
        )}
        unoptimized
        alt={alt}
        width={1000}
        height={1000}
        onLoad={() => setImageLoading(false)}
        {...props}
      />
      {caption && (
        <figcaption className="text-center text-sm text-iris-10">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
