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
    return <div className="h-8 w-[6.5rem]" />
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  return (
    <div className="flex items-center gap-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'grid size-8 place-items-center items-center gap-1.5 p-1 font-pixel-circle text-sm text-iris-12/60 transition-colors',
            theme === value ? 'text-iris-10' : 'hover:text-iris-10'
          )}
          aria-label={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}
