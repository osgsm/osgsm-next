import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'

import {
  AlertTriangle,
  Info,
  BookOpen,
  MessageCircleWarning,
  OctagonAlert,
} from 'lucide-react'

import { cn } from '@/lib/cn'

type CalloutType = 'reference' | 'note' | 'important' | 'warning' | 'caution'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: ReactNode
}

const calloutVariants: Record<
  CalloutType,
  {
    className: string
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >
  }
> = {
  reference: {
    className:
      'bg-blue-3/80 dark:bg-blue-2 border-blue-4 text-blue-11 [--color-accent:var(--color-blue-11)]',
    icon: BookOpen,
  },
  note: {
    className:
      'bg-teal-3/80 dark:bg-teal-2 border-teal-4 text-teal-11 [--color-accent:var(--color-teal-11)]',
    icon: Info,
  },
  important: {
    className:
      'bg-purple-3/80 dark:bg-purple-2 border-purple-5 text-purple-11 [--color-accent:var(--color-purple-11)]',
    icon: MessageCircleWarning,
  },
  warning: {
    className:
      'bg-amber-3/80 dark:bg-amber-2 border-amber-4 text-amber-9 [--color-accent:var(--color-amber-11)]',
    icon: AlertTriangle,
  },
  caution: {
    className:
      'bg-ruby-3/80 dark:bg-ruby-2 border-ruby-4 text-ruby-10 [--color-accent:var(--color-ruby-11)]',
    icon: OctagonAlert,
  },
}

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const Icon = calloutVariants[type].icon
  return (
    <div
      className={cn(
        '-mx-1 my-7 rounded-3xl border p-6',
        '[&_figure]:mt-4! [&_figure]:rounded-2xl! [&_figure]:border-0! [&_figure_code]:bg-transparent!',
        '[&_code]:border-(--color-accent)/15! [&_code]:bg-(--color-accent)/10!',
        '[&_ol]:mt-0! [&_ul]:mt-0!',
        '[&_button]:hidden!',
        calloutVariants[type].className
      )}
    >
      <div className="mb-3 flex items-center gap-1 font-pixel-circle text-xs font-bold tracking-wider uppercase">
        <Icon className="opacity-70" size={13} />
        {title ? <span>{title}</span> : <span>{type}</span>}
      </div>
      <div className="leading-relaxed text-gray-800 dark:text-gray-200 marker:[&_li]:text-(--accent-color)">
        {children}
      </div>
    </div>
  )
}
