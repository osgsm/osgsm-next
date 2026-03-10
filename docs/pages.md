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

すべてのページに適用されるルートレイアウト。

```tsx
// src/app/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ...`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**ポイント:**

- `children` に各 Route Group（`(main)` や `(playground)`）のレイアウトが入る
- `ThemeProvider` でダーク/ライトテーマの切り替えを提供
- Geist フォント（Sans, Mono, Pixel）と Instrument Serif を CSS 変数として設定
- `metadata` でサイト全体のタイトル（テンプレート: `%s | osgsm.io`）や説明を設定
- ヘッダーやフッターはここではなく `(main)` レイアウトで定義

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

### コードの分解

**`'use client'`** — このファイルを Client Component として宣言する。`dynamic()` 自体が内部で React hooks を使うため必須。

**第 1 引数（ローダー関数）:**

```tsx
;() => import('@/components/playground/cube').then((mod) => mod.CubeScene)
```

- `import(...)` は ES の動的 import。通常の `import` 文と違い、実行時にモジュールを非同期で読み込む
- `.then((mod) => mod.CubeScene)` でモジュールから named export を取り出す。default export なら `.then()` を省略可

**第 2 引数（オプション）:**

```tsx
{
  ssr: false
}
```

サーバー側ではこのコンポーネントのモジュールを一切読み込まず、クライアントのハイドレーション後に初めて `import()` が発火する。

### なぜ `'use client'` だけでは不十分か

`'use client'` は「クライアントでのみ実行される」という意味ではない。Client Component でも**初期 HTML を生成するためにサーバー上でレンダリング関数が実行される**（SSR）。

仮に `dynamic()` を使わず直接 import した場合:

```tsx
'use client'
import { CubeScene } from '@/components/playground/cube' // 直接 import

export default function CubePage() {
  return <CubeScene />
}
```

1. サーバーがページをレンダリングするとき `import` 文が評価される
2. Three.js のモジュール初期化コードが `canvas` や `navigator.gpu` にアクセスしようとする
3. サーバーにはこれらの API が存在しないのでクラッシュ

問題はレンダリング関数の中ではなく、**モジュールの読み込み（import）時点**で起きる。`'use client'` はモジュールの読み込み自体を止めることはできない。

|                                            | サーバーでのモジュール読み込み | サーバーでのレンダリング |
| ------------------------------------------ | ------------------------------ | ------------------------ |
| `'use client'` のみ                        | **される**                     | される（初期 HTML 生成） |
| `'use client'` + `dynamic({ ssr: false })` | **されない**                   | されない                 |

`'use client'` は hooks を使うために必要で、`ssr: false` は Three.js のモジュール読み込み自体を防ぐために必要。両方がそれぞれ別の役割を担っている。

### 通常の `import` との違い

|                    | 通常の `import`                  | `dynamic()` + `ssr: false`     |
| ------------------ | -------------------------------- | ------------------------------ |
| 読み込みタイミング | ビルド時にバンドル               | ブラウザで実行時に読み込み     |
| サーバー側         | 実行される                       | 実行されない                   |
| バンドル           | メインバンドルに含まれる         | 別チャンクに分離（コード分割） |
| 初期 HTML          | コンポーネントの HTML が含まれる | 空（プレースホルダー）         |

### なぜ `React.lazy()` ではなく `next/dynamic` を使うのか

`React.lazy()` には `ssr: false` オプションがない。Next.js 環境では SSR が標準で行われるため、SSR を明示的にスキップできる `next/dynamic` が必要。
