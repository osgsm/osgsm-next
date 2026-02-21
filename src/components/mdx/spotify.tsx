async function fetchSpotifyEmbed(url: string): Promise<string | null> {
  try {
    const response = await fetch(`https://open.spotify.com/oembed?url=${url}`)
    const { html } = await response.json()
    return html
  } catch {
    return null
  }
}

export async function Spotify({ url }: { url: string }) {
  const html = await fetchSpotifyEmbed(url)

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
          Spotify で見る
        </a>
      </div>
    )
  }

  return (
    <div
      className="my-6 [&_iframe]:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
