# App Router とページ構成

## App Router とは

Next.js 13 以降で導入された新しいルーティングシステム。`src/app/` ディレクトリ内のフォルダ構造が URL パスに対応する。

## ページ一覧

| パス                   | ファイル                                            | 説明                     |
| ---------------------- | --------------------------------------------------- | ------------------------ |
| `/`                    | `src/app/(main)/page.tsx`                           | ホームページ             |
| `/blog`                | `src/app/(main)/blog/page.tsx`                      | ブログ一覧               |
| `/blog/[slug]`         | `src/app/(main)/blog/[slug]/page.tsx`               | ブログ記事詳細           |
| `/note`                | `src/app/(main)/note/page.tsx`                      | ノート一覧               |
| `/note/[slug]`         | `src/app/(main)/note/[slug]/page.tsx`               | ノート詳細               |
| `/playground`          | `src/app/(main)/playground/page.tsx`                | Playground ハブ          |
| `/playground/cube`     | `src/app/(playground)/playground/cube/page.tsx`     | 3D キューブ              |
| `/playground/gradient` | `src/app/(playground)/playground/gradient/page.tsx` | グラデーションシェーダー |

## Route Groups

同じ URL パス配下でも、ページの種類に応じて異なるレイアウトを適用するために **Route Groups** を使用している。フォルダ名の括弧は URL に影響しない。

| Route Group    | レイアウトファイル                | 内容                                       |
| -------------- | --------------------------------- | ------------------------------------------ |
| `(main)`       | `src/app/(main)/layout.tsx`       | Header + Footer + `max-w-3xl` コンテンツ幅 |
| `(playground)` | `src/app/(playground)/layout.tsx` | 「← Back to playground」リンクのみ         |

例えば `/playground`（ハブ）は `(main)` レイアウト内で表示され、`/playground/cube`（個別ページ）は `(playground)` レイアウトでフルスクリーン表示される。

## レイアウト

| ファイル                          | 適用範囲                   | 内容                               |
| --------------------------------- | -------------------------- | ---------------------------------- |
| `src/app/layout.tsx`              | 全ページ                   | `<html>`, `<body>`, グローバル CSS |
| `src/app/(main)/layout.tsx`       | ブログ、ノート、ハブページ | Header + Footer + コンテンツ幅制限 |
| `src/app/(playground)/layout.tsx` | Playground 個別ページ      | 戻るリンクのみのミニマル UI        |

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

## 動的インポート（`next/dynamic`）

Playground の個別ページでは `next/dynamic` + `{ ssr: false }` を使って、Three.js コンポーネントの SSR を無効化している。

```tsx
'use client'

import dynamic from 'next/dynamic'

const CubeScene = dynamic(
  () => import('@/components/playground/cube').then((mod) => mod.CubeScene),
  { ssr: false }
)
```

Three.js はブラウザ API（`canvas`, `navigator.gpu`）に依存するため、サーバーサイドでは実行できない。詳細は [three-webgpu.md](./three-webgpu.md#ssr-無効化が必要な理由) を参照。
