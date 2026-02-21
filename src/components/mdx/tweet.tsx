import { TweetEmbed } from './tweet-embed'

async function fetchTweetEmbed(url: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://publish.twitter.com/oembed?url=${url}&omit_script=true`
    )
    const { html } = await response.json()
    return html
  } catch {
    return null
  }
}

export async function Tweet({ url }: { url: string }) {
  const html = await fetchTweetEmbed(url)

  if (!html) {
    return (
      <div className="my-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-gray-500">
        ツイートを読み込めませんでした。
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 hover:underline"
        >
          Twitter で見る
        </a>
      </div>
    )
  }

  return <TweetEmbed html={html} />
}
