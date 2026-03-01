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
    { value: 'system', icon: MonitorCog, label: 'System' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ] as const

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <div className="flex items-center gap-x-1 rounded-full border border-border bg-iris-3/75 p-0.5">
        {options.map(({ value, label, icon: Icon }) => {
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'grid rounded-full border border-transparent p-1.5 leading-none text-iris-11/75 backdrop-blur-sm transition-colors',
                theme === value
                  ? 'border-iris-5 bg-iris-4 text-iris-11'
                  : 'hover:text-iris-10'
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
