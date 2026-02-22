'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/cn'

const options = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1" suppressHydrationWarning>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            theme === value
              ? 'bg-foreground/10 text-foreground'
              : 'text-foreground/40 hover:text-foreground/70'
          )}
          aria-label={label}
          suppressHydrationWarning
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}
