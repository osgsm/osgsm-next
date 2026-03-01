import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/mdx'
import { PostItem } from '@/components/post-list'

export default function Home() {
  const blogPosts = getAllPosts('blog').slice(0, 4)
  const notePosts = getAllPosts('note').slice(0, 4)

  return (
    <div>
      <header className="my-16 mb-24">
        <h1 className="sr-only">osgsm.io</h1>
        <p className="mb-4 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
          Welcom to my playground!
        </p>
        <p className="mb-4 grid font-features-['palt'] text-2xl leading-snug tracking-wide md:text-3xl">
          <span>ようこそ👋🏼 </span>
          <span>大島翔吾と申します。</span>
        </p>
        <p className="grid font-features-['palt'] text-sm leading-[1.9] tracking-wide lg:text-base">
          <span>ウェブサイトつくったりしてます。</span>
          <span>最近の関心は WebGL (WebGPU) 。</span>
          <span>
            日々の学びとか、つくったものを載せていきます
            <small className="opacity-60">（予定）</small>。
          </span>
        </p>
      </header>

      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl text-iris-9 lg:text-2xl">Blog</h2>
          <Link
            href="/blog"
            className="block rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 text-sm leading-none text-iris-11 backdrop-blur-sm"
          >
            view all
          </Link>
        </div>
        <ul className="grid gap-3">
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
            className="block rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 text-sm leading-none text-iris-11 backdrop-blur-sm"
          >
            view all
          </Link>
        </div>
        <ul className="grid gap-3">
          {notePosts.map((post) => (
            <PostItem key={post.slug} post={post} basePath="/note" />
          ))}
        </ul>
      </section>
    </div>
  )
}
