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
    className: 'bg-blue-2 border-blue-4 text-blue-8',
    icon: Info,
  },
  tip: {
    className: 'bg-teal-2 border-teal-4 text-teal-8',
    icon: Lightbulb,
  },
  important: {
    className: 'bg-purple-2 border-purple-5 text-purple-9',
    icon: MessageCircleWarning,
  },
  warning: {
    className: 'bg-amber-2 border-amber-4 text-amber-8',
    icon: AlertTriangle,
  },
  caution: {
    className: 'bg-ruby-2 border-ruby-4 text-ruby-8',
    icon: OctagonAlert,
  },
}

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const Icon = calloutVariants[type].icon
  return (
    <div
      className={cn(
        '-mx-1 my-7 rounded-3xl border p-6',
        calloutVariants[type].className
      )}
    >
      <h3 className="pb-3 text-base leading-none text-inherit lg:text-lg">
        <span className="flex items-center gap-1.5 font-sans">
          <Icon size={15} />
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
