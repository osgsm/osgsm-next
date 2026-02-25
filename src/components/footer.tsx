import { ThemeToggle } from '@/components/theme-toggle'

export function Footer() {
  return (
    <footer className="font-pixel-circle text-sm font-bold tracking-wider">
      <div className="mx-auto flex max-w-3xl items-end justify-between px-4 py-4 sm:items-center">
        <p>&copy; Shogo Oshima</p>
        <ThemeToggle />
      </div>
    </footer>
  )
}
