import { BlueskyEmbed } from './bluesky-embed'

async function fetchBlueskyEmbed(url: string): Promise<string | null> {
  try {
    const response = await fetch(`https://embed.bsky.app/oembed?url=${url}`)
    const { html } = await response.json()
    return html
  } catch {
    return null
  }
}

export async function Bluesky({ url }: { url: string }) {
  const html = await fetchBlueskyEmbed(url)

  if (!html) {
    return (
      <div className="my-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-gray-500">
        投稿を読み込めませんでした。
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 hover:underline"
        >
          Bluesky で見る
        </a>
      </div>
    )
  }

  return <BlueskyEmbed html={html} />
}
