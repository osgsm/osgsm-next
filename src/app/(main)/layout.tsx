import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { getAllPosts } from '@/lib/mdx'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const blogPosts = getAllPosts('blog')
  const notePosts = getAllPosts('note')

  return (
    <>
      <Header blogPosts={blogPosts} notePosts={notePosts} />
      <main className="mx-auto w-full max-w-3xl px-6 py-8">{children}</main>
      <Footer />
    </>
  )
}
