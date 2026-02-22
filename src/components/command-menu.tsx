'use client'

import { Command } from 'cmdk'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { PostMeta } from '@/lib/mdx'

export function CommandMenu({
  blogPosts,
  notePosts,
}: {
  blogPosts: PostMeta[]
  notePosts: PostMeta[]
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((current) => !current)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (type: string, slug: string) => {
    router.push(`/${type}/${slug}`)
    setOpen(false)
  }

  const filter = (value: string, search: string, keywords?: string[]) => {
    const extendedValue = keywords ? `${value} ${keywords.join(' ')}` : value
    if (extendedValue.toLowerCase().includes(search.toLowerCase())) {
      return 1
    }
    return 0
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground/80"
        aria-label="Search"
      >
        <Search size={16} />
        <kbd className="pointer-events-none hidden rounded border px-1.5 py-0.5 text-[10px] sm:inline-block">
          <span>&#8984;K</span>
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Search posts"
        filter={filter}
      >
        <DialogTitle className="sr-only">Search posts</DialogTitle>
        <DialogDescription className="sr-only">
          Search blog and note posts
        </DialogDescription>
        <Command.Input placeholder="Search posts..." autoFocus />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>

          {blogPosts.length > 0 && (
            <Command.Group heading="Blog">
              {blogPosts.map((post) => (
                <Command.Item
                  key={post.slug}
                  value={post.title}
                  keywords={[post.title, ...(post.tags ?? [])]}
                  onSelect={() => handleSelect('blog', post.slug)}
                >
                  {post.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {notePosts.length > 0 && (
            <Command.Group heading="Note">
              {notePosts.map((post) => (
                <Command.Item
                  key={post.slug}
                  value={post.title}
                  keywords={[post.title, ...(post.tags ?? [])]}
                  onSelect={() => handleSelect('note', post.slug)}
                >
                  {post.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command.Dialog>
    </>
  )
}
