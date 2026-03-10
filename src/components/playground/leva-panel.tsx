'use client'

import { type ComponentProps, useSyncExternalStore } from 'react'
import { Leva } from 'leva'

const mdQuery = '(min-width: 768px)'
const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(mdQuery)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}
const getSnapshot = () => window.matchMedia(mdQuery).matches
const getServerSnapshot = () => true

export type LevaPanelProps = ComponentProps<typeof Leva>

export function LevaPanel(props: LevaPanelProps) {
  const isDesktop = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const { titleBar, collapsed, ...rest } = props
  const mergedTitleBar =
    typeof titleBar === 'object'
      ? { drag: false, ...titleBar }
      : titleBar === false
        ? false
        : { drag: false }

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] flex items-end justify-start p-2.5 md:items-start md:justify-end">
      <div className="pointer-events-auto max-h-[70vh] w-[280px] overflow-y-auto">
        <Leva
          fill
          collapsed={collapsed ?? !isDesktop}
          oneLineLabels
          titleBar={mergedTitleBar}
          {...rest}
        />
      </div>
    </div>
  )
}
