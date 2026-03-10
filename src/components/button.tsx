import Link from 'next/link'
import { cn } from '@/lib/cn'

export function Button({
  href = '#',
  children,
  className,
}: React.ComponentPropsWithoutRef<'a'>) {
  return (
    <Link
      href={href}
      className={cn(
        'group',
        'block w-fit rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 backdrop-blur-sm',
        'text-sm leading-none text-iris-11',
        'transition-colors',
        'hover:border-iris-6',
        'md:text-base md:leading-none',
        className
      )}
    >
      <span
        className={cn(
          'flex items-center gap-1',
          'transition-colors',
          'group-hover:text-iris-12'
        )}
      >
        {children}
      </span>
    </Link>
  )
}
