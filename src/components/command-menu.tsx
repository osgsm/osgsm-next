'use client'

import { Command } from 'cmdk'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

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
        className="flex rounded-full border border-iris-5 bg-iris-4 p-0.5 backdrop-blur-sm"
        aria-label="Search"
      >
        <span className="flex items-center gap-1 rounded-full border border-iris-5 bg-iris-3 px-1.5 py-1.5 leading-none text-iris-11 md:px-2.5">
          <Search size={15} />
          <span className="hidden text-sm leading-none tracking-wide text-iris-11/75 md:block">
            ⌘K
          </span>
        </span>
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
