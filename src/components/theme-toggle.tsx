'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
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
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <div className="px-1 italic lg:px-0">Theme:</div>
      <div className="flex items-center">
        {options.map(({ value, icon: Icon, label }, index) => (
          <>
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'grid gap-1.5 p-1 text-iris-12/60 transition-colors',
                theme === value ? 'text-iris-10' : 'hover:text-iris-10'
              )}
              aria-label={label}
            >
              {label}
            </button>
            {index !== options.length - 1 && (
              <span className="text-iris-12/40">/</span>
            )}
          </>
        ))}
      </div>
    </div>
  )
}
