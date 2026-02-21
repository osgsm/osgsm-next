import type { MDXComponents } from 'mdx/types'
import type { PluggableList } from 'unified'

import { transformerNotationDiff } from '@shikijs/transformers'
import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/cn'

import {
  Bluesky,
  Callout,
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
    type?: 'note' | 'tip' | 'important' | 'warning' | 'caution'
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
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: ({ children, id }: React.HTMLAttributes<HTMLHeadingElement>) => {
    if (id?.includes('footnote-label')) {
      return null
    }
    return (
      <h2 id={id} className="text-2xl font-bold mt-6 mb-3">
        {children}
      </h2>
    )
  },
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-4 leading-relaxed" {...props} />
  ),
  a: ({ children, href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href?.startsWith('#user-content-fn-')) {
      return (
        <FootnoteForwardReference href={href}>
          {children}
        </FootnoteForwardReference>
      )
    }
    return (
      <Link href={href} className="text-gray-600 dark:text-gray-400" underline>
        {children}
      </Link>
    )
  },
  blockquote: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        'mt-6 border-gray-300 dark:border-gray-600 border-l-2 pl-6 text-gray-500',
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
        'border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        'border border-gray-200 dark:border-gray-700 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
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
      return <ol data-footnotes>{props.children}</ol>
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
        <li id={props.id}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              if (child.type === 'p') {
                const href = (
                  child.props as { children?: React.ReactNode[] }
                ).children?.find((innerChild: React.ReactNode) => {
                  if (React.isValidElement(innerChild)) {
                    return (
                      React.isValidElement(innerChild) &&
                      'props' in innerChild &&
                      (innerChild.props as { href?: string }).href?.includes(
                        'user-content-fnref-'
                      )
                    )
                  }
                  return false
                }) as React.ReactElement<{ href?: string }> | undefined

                const filteredChildren = (
                  child.props as { children?: React.ReactNode[] }
                ).children?.filter((innerChild: React.ReactNode) => {
                  if (React.isValidElement(innerChild)) {
                    return !(
                      React.isValidElement(innerChild) &&
                      'props' in innerChild &&
                      (innerChild.props as { href?: string }).href?.includes(
                        'user-content-fnref-'
                      )
                    )
                  }
                  return true
                })

                return (
                  <FootnoteBackReference href={href?.props?.href || ''}>
                    {filteredChildren}
                  </FootnoteBackReference>
                )
              }
              return child
            }
            return child
          })}
        </li>
      )
    }
    return (
      <li className={cn('mt-1 ml-2 list-item marker:text-gray-400', className)}>
        {children}
      </li>
    )
  },
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
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypePrettyCode,
              {
                theme: {
                  dark: 'github-dark',
                  light: 'github-light',
                },
                keepBackground: false,
                defaultLang: 'plaintext',
                transformers: [transformerNotationDiff()],
              },
            ],
          ] as PluggableList,
        },
      }}
    />
  )
}
