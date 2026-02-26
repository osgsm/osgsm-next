import { ThemeToggle } from '@/components/theme-toggle'

export function Footer() {
  return (
    <footer className="font-serif text-base text-iris-10">
      <div className="mx-auto flex max-w-3xl items-end justify-between px-4 py-4 sm:items-center">
        <p className="italic">&copy; Shogo Oshima</p>
        <ThemeToggle />
      </div>
    </footer>
  )
}
