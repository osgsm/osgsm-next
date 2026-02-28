import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/mdx'
import { PostItem } from '@/components/post-list'

export default function Home() {
  const blogPosts = getAllPosts('blog').slice(0, 4)
  const notePosts = getAllPosts('note').slice(0, 4)

  return (
    <div>
      <header className="mt-20 mb-25">
        <h1 className="sr-only">osgsm.io</h1>
        <p className="mb-4 font-pixel-circle text-lg font-bold tracking-wider text-iris-9 uppercase">
          Welcom to my playground!
        </p>
        <p className="grid gap-y-1 text-lg text-iris-11">
          <span>私の名前は大島翔吾。</span>
          <span>ウェブ上での表現をつくる人です。</span>
          <span>近頃は、WebGL とか WebGPU に惹かれてます。</span>
        </p>
      </header>

      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl text-iris-9 lg:text-2xl">Blog</h2>
          <Link
            href="/blog"
            className="flex items-center gap-1 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase transition-colors hover:text-iris-12"
          >
            View all
          </Link>
        </div>
        <ul>
          {blogPosts.map((post) => (
            <PostItem key={post.slug} post={post} basePath="/blog" />
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl text-iris-9 lg:text-2xl">Note</h2>
          <Link
            href="/note"
            className="flex items-center gap-1 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase transition-colors hover:text-iris-12"
          >
            View all
          </Link>
        </div>
        <ul>
          {notePosts.map((post) => (
            <PostItem key={post.slug} post={post} basePath="/note" />
          ))}
        </ul>
      </section>
    </div>
  )
}
