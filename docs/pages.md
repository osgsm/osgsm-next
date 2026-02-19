# App Router とページ構成

## App Router とは

Next.js 13 以降で導入された新しいルーティングシステム。`src/app/` ディレクトリ内のフォルダ構造が URL パスに対応する。

## ページ一覧

| パス           | ファイル                       | 説明           |
| -------------- | ------------------------------ | -------------- |
| `/`            | `src/app/page.tsx`             | ホームページ   |
| `/blog`        | `src/app/blog/page.tsx`        | ブログ一覧     |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | ブログ記事詳細 |
| `/note`        | `src/app/note/page.tsx`        | ノート一覧     |
| `/note/[slug]` | `src/app/note/[slug]/page.tsx` | ノート詳細     |

## 重要なファイル

### `layout.tsx`

すべてのページに適用される共通レイアウト。

```tsx
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <header>...</header> {/* 共通ヘッダー */}
        <main>{children}</main> {/* ページコンテンツがここに入る */}
      </body>
    </html>
  )
}
```

**ポイント:**

- `children` に各ページの内容が入る
- ヘッダーやフッターなど共通部分をここに書く
- `metadata` でサイト全体のタイトルや説明を設定

### `page.tsx`

各ルートのページコンポーネント。

```tsx
// src/app/page.tsx（ホームページ）
export default function Home() {
  return <div>ホームページの内容</div>
}
```

## 動的ルート

`[slug]` のような角括弧で囲んだフォルダ名は**動的ルート**。

### 例: `/blog/[slug]/page.tsx`

```tsx
type Props = {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params // URL から slug を取得
  // /blog/hello-world なら slug は "hello-world"

  const post = getPostBySlug('blog', slug)
  return <article>...</article>
}
```

### `generateStaticParams()`

ビルド時に静的生成するページのパラメータを返す。

```tsx
export async function generateStaticParams() {
  const slugs = getPostSlugs('blog')
  return slugs.map((slug) => ({ slug }))
  // [{ slug: 'hello-world' }, { slug: 'second-post' }, ...]
}
```

これにより、すべてのブログ記事がビルド時に HTML として生成される（SSG: Static Site Generation）。

### `generateMetadata()`

動的にページのメタデータ（title, description）を設定する。

```tsx
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug('blog', slug)

  return {
    title: post.title, // <title>Hello World | osgsm</title>
    description: post.description,
  }
}
```

## Server Components

App Router では、デフォルトですべてのコンポーネントが **Server Components**。

- サーバー側で実行される
- `fs` などの Node.js API が使える
- クライアントにはレンダリング済みの HTML が送られる

クライアント側の機能（useState, onClick など）が必要な場合は `'use client'` を先頭に書く。
