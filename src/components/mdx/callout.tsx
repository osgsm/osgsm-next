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
    className: 'bg-blue-2 border-blue-8 text-blue-9',
    icon: Info,
  },
  tip: {
    className: 'bg-teal-2 border-teal-8 text-teal-9',
    icon: Lightbulb,
  },
  important: {
    className: 'bg-purple-2 border-purple-9 text-purple-10',
    icon: MessageCircleWarning,
  },
  warning: {
    className: 'bg-amber-2 border-amber-8 text-amber-9',
    icon: AlertTriangle,
  },
  caution: {
    className: 'bg-ruby-2 border-ruby-8 text-ruby-9',
    icon: OctagonAlert,
  },
}

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const Icon = calloutVariants[type].icon
  return (
    <div className={cn('my-7 border p-6', calloutVariants[type].className)}>
      <h3 className="pb-3 text-sm leading-none text-inherit">
        <span className="flex items-center gap-1.5 font-pixel-square tracking-wider">
          <Icon size={16} />
          {title ? (
            <span>{title}</span>
          ) : (
            <span className="uppercase">{type}</span>
          )}
        </span>
      </h3>
      <div className="leading-relaxed text-gray-800 *:mt-0 dark:text-gray-200 [&_*+*]:mt-2">
        {children}
      </div>
    </div>
  )
}
