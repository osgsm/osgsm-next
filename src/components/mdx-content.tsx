import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-4 leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside my-4 space-y-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-4" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-blue-600 hover:underline" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic my-4"
      {...props}
    />
  ),
}

type MDXContentProps = {
  source: string
}

export function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: 'github-dark',
              },
            ],
          ],
        },
      }}
    />
  )
}
