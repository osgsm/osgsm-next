import Link from 'next/link'
import { getAllPosts } from '@/lib/mdx'

export const metadata = {
  title: 'Note',
  description: 'Notes',
}

export default function NotePage() {
  const posts = getAllPosts('note')

  return (
    <div>
      <h1 className="text-3xl font-bold">Note</h1>
      <ul className="mt-8 space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/note/${post.slug}`}
                className="block rounded-lg border p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <div className="text-sm text-gray-500">
                  <time>{post.date}</time>
                  {post.category && <span> · {post.category}</span>}
                </div>
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
    </div>
  )
}
