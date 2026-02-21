'use client'

export function BlueskyEmbed({ html }: { html: string }) {
  return (
    <div
      className="my-6 [&_iframe]:rounded-xl"
      dangerouslySetInnerHTML={{
        __html: html.replace(
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          ''
        ),
      }}
    />
  )
}
