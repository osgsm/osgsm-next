import { getAllPosts } from '@/lib/mdx'
import { Button } from '@/components/button'
import { PostItem } from '@/components/post-list'
import DecryptedText from '@/components/decrypted-text'

export default function Home() {
  const blogPosts = getAllPosts('blog').slice(0, 4)
  const notePosts = getAllPosts('note').slice(0, 4)

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="my-16 mb-24">
        <h1 className="sr-only">osgsm.io</h1>
        <p className="mb-4 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
          <DecryptedText
            animateOn="view"
            text="Welcome. No rush, just pixels."
            sequential
            speed={30}
            useOriginalCharsOnly
          />
        </p>
        <p className="mb-4 grid font-features-['palt'] text-2xl leading-snug tracking-wide md:text-3xl">
          <span>ようこそ👋🏼 </span>
          <span>大島翔吾と申します。</span>
        </p>
        <p className="grid text-sm leading-[1.9] tracking-wide md:text-base">
          <span>ウェブサイトをつくったりしてます。</span>
          <span>最近の関心は WebGL (WebGPU) 。</span>
          <span>
            日々の学びとか、制作物を載せていきます
            <small className="-mx-1.5 opacity-60">（予定）</small>。
          </span>
        </p>
      </header>

      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl text-iris-9 lg:text-2xl">Blog</h2>
          <Button className="text-sm/none" href="/blog/">
            view all
          </Button>
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
          <Button className="text-sm/none" href="/note/">
            view all
          </Button>
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
