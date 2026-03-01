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
        'group block rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 leading-none text-iris-11 backdrop-blur-sm transition-colors',
        'hover:border-iris-6 hover:bg-iris-5',
        className
      )}
    >
      <span className="block -translate-y-px transition-colors group-hover:text-iris-12">
        {children}
      </span>
    </Link>
  )
}
