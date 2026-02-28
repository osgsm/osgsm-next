'use client'

import { MonitorCog, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/cn'

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const { theme, setTheme } = useTheme()

  if (!mounted) {
    return <div className="h-8 w-26" />
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: MonitorCog, label: 'System' },
  ] as const

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <div className="relative top-1 flex items-center gap-x-1">
        {options.map(({ value, label, icon: Icon }, index) => {
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'grid size-7 place-items-center gap-1.5 p-1 text-iris-12/60 transition-colors',
                theme === value ? 'text-iris-10' : 'hover:text-iris-10'
              )}
              aria-label={label}
            >
              <Icon size={16} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
