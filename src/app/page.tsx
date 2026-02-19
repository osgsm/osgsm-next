import Link from 'next/link'
import { getAllPosts } from '@/lib/mdx'

export default function Home() {
  const blogPosts = getAllPosts('blog').slice(0, 3)
  const notePosts = getAllPosts('note').slice(0, 3)

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          This is my personal portfolio. I write about programming and other
          topics.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Blog</h2>
          <Link href="/blog" className="text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-4">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <h3 className="font-semibold">{post.title}</h3>
                  <time className="text-sm text-gray-500">{post.date}</time>
                  {post.description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {post.description}
                    </p>
                  )}
                </Link>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No posts yet.</li>
          )}
        </ul>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Note</h2>
          <Link href="/note" className="text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-4">
          {notePosts.length > 0 ? (
            notePosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/note/${post.slug}`}
                  className="block rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <h3 className="font-semibold">{post.title}</h3>
                  <time className="text-sm text-gray-500">{post.date}</time>
                  {post.description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {post.description}
                    </p>
                  )}
                </Link>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No notes yet.</li>
          )}
        </ul>
      </section>
    </div>
  )
}
