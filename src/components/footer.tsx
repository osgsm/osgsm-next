import { ThemeToggle } from '@/components/theme-toggle'

export function Footer() {
  return (
    <footer className="mt-20 font-sans text-sm text-iris-8">
      <div className="mx-auto flex max-w-3xl items-end justify-between px-4 py-4 sm:items-center">
        <div>
          <p>&copy; Shogo Oshima</p>
          <p className="grid">
            <span>Built with ☕ in Osaka, Japan</span>
          </p>
        </div>
        <ThemeToggle />
      </div>
    </footer>
  )
}
