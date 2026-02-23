import { ThemeToggle } from '@/components/theme-toggle'

export function Footer() {
  return (
    <footer className="font-pixel-circle text-sm font-bold tracking-widest uppercase">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <p>&copy; Shogo Oshima</p>
        <ThemeToggle />
      </div>
    </footer>
  )
}
