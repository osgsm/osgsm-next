import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'

import {
  AlertTriangle,
  Info,
  Lightbulb,
  MessageCircleWarning,
  OctagonAlert,
} from 'lucide-react'

import { cn } from '@/lib/cn'

type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

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
  note: {
    className:
      'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    icon: Info,
  },
  tip: {
    className:
      'bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300',
    icon: Lightbulb,
  },
  important: {
    className:
      'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    icon: MessageCircleWarning,
  },
  warning: {
    className:
      'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    icon: AlertTriangle,
  },
  caution: {
    className:
      'bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300',
    icon: OctagonAlert,
  },
}

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const Icon = calloutVariants[type].icon
  return (
    <div className={cn('my-10 border p-6', calloutVariants[type].className)}>
      <h3 className="pb-3 text-sm leading-none text-inherit">
        <span className="flex items-center gap-1.5">
          <Icon size={16} />
          {title ? (
            <span>{title}</span>
          ) : (
            <span className="capitalize">{type}</span>
          )}
        </span>
      </h3>
      <div className="leading-relaxed text-gray-800 *:mt-0 dark:text-gray-200 [&_*+*]:mt-2">
        {children}
      </div>
    </div>
  )
}
