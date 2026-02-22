import { ThemeToggle } from '@/components/theme-toggle'

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <p className="text-sm text-foreground/50">
          &copy; {new Date().getFullYear()} osgsm
        </p>
        <ThemeToggle />
      </div>
    </footer>
  )
}
