import { getAllPosts } from '@/lib/mdx'
import { Button } from '@/components/button'
import { PostItem } from '@/components/post-list'
import { PlaygroundCard } from '@/components/playground-card'
import { playgroundItems } from '@/lib/playground'
import DecryptedText from '@/components/decrypted-text'

export default function Home() {
  const blogPosts = getAllPosts('blog').slice(0, 6)
  const notePosts = getAllPosts('note').slice(0, 6)

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="my-16 mb-28 lg:my-24 lg:mb-40">
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
          <span>ここには、日々の学びとか習作を載せてます。</span>
        </p>
      </header>

      <section className="mt-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl text-iris-10 lg:text-2xl">Playground</h2>
          <Button className="text-sm/none" href="/playground/">
            view all
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
          {playgroundItems.slice(0, 4).map((item) => (
            <PlaygroundCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section className="mt-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl text-iris-10 lg:text-2xl">Blog</h2>
          <Button className="text-sm/none" href="/blog/">
            view all
          </Button>
        </div>
        <ul className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
          {blogPosts.map((post) => (
            <PostItem key={post.slug} post={post} basePath="/blog" />
          ))}
        </ul>
      </section>

      <section className="mt-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl text-iris-10 lg:text-2xl">Note</h2>
          <Button className="text-sm/none" href="/note/">
            view all
          </Button>
        </div>
        <ul className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
          {notePosts.map((post) => (
            <PostItem key={post.slug} post={post} basePath="/note" />
          ))}
        </ul>
      </section>
    </div>
  )
}
