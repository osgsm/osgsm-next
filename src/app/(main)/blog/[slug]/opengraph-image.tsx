import { getPostBySlug, getPostSlugs } from '@/lib/mdx'
import { generateOGImage } from '@/lib/og'

export const alt = 'Blog post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  const slugs = getPostSlugs('blog')
  return slugs.map((slug) => ({ slug }))
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug('blog', slug)
  const title = post?.title ?? slug

  return generateOGImage(title, 'blog')
}
