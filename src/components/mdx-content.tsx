import type { MDXComponents } from 'mdx/types'

import { transformerNotationDiff } from '@shikijs/transformers'
import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { Asterisk } from 'lucide-react'

import { cn } from '@/lib/cn'

import {
  Bluesky,
  Callout,
  CodeBlock,
  CodeSandbox,
  FootnoteBackReference,
  FootnoteForwardReference,
  Link,
  MDXImage,
  MDXVideo,
  Preview,
  Spotify,
  Tweet,
} from './mdx'

const components: MDXComponents = {
  // Custom components
  CodeSandbox: ({ id, module }: { id: string; module?: string }) => (
    <CodeSandbox id={id} module={module} />
  ),
  Callout: ({
    type,
    title,
    children,
  }: {
    type?: 'note' | 'reference' | 'important' | 'warning' | 'caution'
    title?: string
    children: React.ReactNode
  }) => (
    <Callout type={type} title={title}>
      {children}
    </Callout>
  ),
  Video: ({
    src,
    caption,
    autoPlay,
    controls,
    loop,
    muted,
  }: {
    src: string
    caption?: string
    autoPlay?: boolean
    controls?: boolean
    loop?: boolean
    muted?: boolean
  }) => (
    <MDXVideo
      src={src}
      caption={caption}
      autoPlay={autoPlay}
      controls={controls}
      loop={loop}
      muted={muted}
    />
  ),
  Bluesky: ({ url }: { url: string }) => <Bluesky url={url} />,
  Spotify: ({ url }: { url: string }) => <Spotify url={url} />,
  Tweet: ({ url }: { url: string }) => <Tweet url={url} />,
  Preview: ({
    children,
    codeblock,
    dark,
  }: {
    children?: React.ReactNode
    codeblock?: string
    dark?: string
  }) => (
    <Preview
      codeblock={codeblock ? codeblock : undefined}
      dark={dark ? dark : undefined}
    >
      {children}
    </Preview>
  ),
  Image: ({
    className,
    caption,
    alt,
    src,
    ...props
  }: {
    className?: string
    caption?: string
    alt: string
    src: string
  }) => (
    <MDXImage
      {...props}
      src={src}
      className={className}
      caption={caption}
      alt={alt}
    />
  ),

  // HTML element overrides
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mt-8 mb-4 text-2xl lg:text-3xl" {...props} />
  ),
  h2: ({ children, id }: React.HTMLAttributes<HTMLHeadingElement>) => {
    if (id?.includes('footnote-label')) {
      return null
    }
    return (
      <h2
        id={id}
        className="mt-[2.75em] mb-6 text-xl before:mr-1.5 before:text-iris-8 before:content-['##'] lg:text-2xl"
      >
        {children}
      </h2>
    )
  },
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-[2em] mb-6 text-lg before:mr-1.5 before:text-iris-8 before:content-['###'] lg:text-xl"
      {...props}
    />
  ),
  a: ({
    children,
    href,
    id,
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href?.startsWith('#user-content-fn-')) {
      return (
        <FootnoteForwardReference id={id} href={href}>
          {children}
        </FootnoteForwardReference>
      )
    }
    if (href?.includes('user-content-fnref-')) {
      return <FootnoteBackReference id={id} href={href || ''} />
    }
    return (
      <Link
        href={href}
        className="text-iris-10 underline decoration-transparent underline-offset-4 transition-all hover:decoration-iris-8"
      >
        {children}
      </Link>
    )
  },
  p: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <p
      className="my-[1.5em] text-[0.9375rem] leading-[1.9] first:mt-0 last:mb-0 sm:text-base"
      {...props}
    />
  ),
  blockquote: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        'mt-6 border-l-2 border-gray-300 pl-6 text-gray-500 dark:border-gray-600',
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-hidden overflow-y-auto">
      <table className={cn('w-full overflow-hidden', className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        'border border-gray-200 px-4 py-2 text-left font-semibold dark:border-gray-700 [[align=center]]:text-center [[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        'border border-gray-200 px-4 py-2 text-left dark:border-gray-700 [[align=center]]:text-center [[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => {
    if (
      React.Children.toArray(props.children).some(
        (child) =>
          React.isValidElement(child) &&
          (child as React.ReactElement<{ id?: string }>).props.id?.includes(
            'user-content-fn-'
          )
      )
    ) {
      return (
        <div className="-mx-1 my-10 rounded-3xl border border-border bg-iris-3 p-6 dark:bg-iris-2">
          <h2 className="mb-3 flex items-center gap-1 font-pixel-circle text-xs font-bold tracking-wider text-iris-11 uppercase">
            <Asterisk
              className="-translate-y-[0.03125rem] opacity-70"
              size={14}
            />
            Footnote
          </h2>
          <ol data-footnotes>{props.children}</ol>
        </div>
      )
    }
    return (
      <ol
        className={cn('mt-2 ml-3 list-decimal leading-relaxed', className)}
        {...props}
      />
    )
  },
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        'mt-6 ml-3 list-disc leading-relaxed [li>&]:mt-0',
        className
      )}
      {...props}
    />
  ),
  li: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLLIElement>) => {
    if (props.id?.includes('user-content-fn-')) {
      return (
        <li className="[&_p]:leading-relaxed" id={props.id}>
          {children}
        </li>
      )
    }
    return (
      <li
        className={cn(
          'mt-2 ml-2 list-item marker:text-(--color-accent,var(--color-mauve-8))/40',
          className
        )}
      >
        {children}
      </li>
    )
  },
  figure: (
    props: React.HTMLAttributes<HTMLElement> & {
      'data-rehype-pretty-code-figure'?: string
    }
  ) => {
    if ('data-rehype-pretty-code-figure' in props) {
      return <CodeBlock {...props} />
    }
    return <figure {...props} />
  },
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded-lg border border-border bg-iris-3 px-1.5 py-0.5 text-[90%]"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="" {...props} />
  ),
  hr: (props: React.HTMLAttributes<HTMLElement>) => (
    <hr
      className="mx-auto my-17 block w-10 border-t border-border"
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
        blockJS: false,
        blockDangerousJS: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypePrettyCode,
              {
                theme: {
                  dark: 'catppuccin-mocha',
                  light: 'catppuccin-latte',
                },
                keepBackground: false,
                defaultLang: 'plaintext',
                transformers: [transformerNotationDiff()],
              },
            ],
          ],
        },
      }}
    />
  )
}
