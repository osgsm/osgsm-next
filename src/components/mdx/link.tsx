import { SquareArrowOutUpRight } from 'lucide-react'
import NextLink from 'next/link'

import { cn } from '@/lib/cn'

interface LinkProps extends React.HTMLProps<HTMLAnchorElement> {
  text?: string
  underline?: boolean
  className?: string
}

const Link = ({ text, href, underline, className, children }: LinkProps) => {
  const isInternalLink = href?.startsWith('/') || href?.startsWith('#')
  return isInternalLink ? (
    <NextLink
      href={href ?? ''}
      className={cn(
        'text-gray-600 dark:text-gray-400',
        className,
        'underline decoration-1 decoration-gray-400 underline-offset-2'
      )}
    >
      {children}
    </NextLink>
  ) : (
    <a
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn('text-gray-600 dark:text-gray-400', className, {
        'underline decoration-1 decoration-gray-400 underline-offset-2':
          underline,
      })}
      href={href}
    >
      {text || children}
      <span className="mx-0.5 inline-flex text-gray-500">
        <SquareArrowOutUpRight className="inline-block size-3 translate-y-px" />
      </span>
    </a>
  )
}

export default Link
