# MDX の仕組みと使い方

## MDX とは

MDX = Markdown + JSX。Markdown の中で React コンポーネントを使える形式。

```mdx
# タイトル

通常の Markdown テキスト。

<CustomButton>クリック</CustomButton> {/* React コンポーネントも使える */}
```

## コンテンツ構造

```
content/
├── blog/
│   └── hello-world.mdx
└── note/
    └── first-note.mdx
```

## MDX ファイルの書き方

### Frontmatter（メタデータ）

ファイル先頭の `---` で囲まれた部分。YAML 形式で記事のメタデータを定義する。

```mdx
---
title: Hello World
date: 2024-01-01
description: 最初のブログ記事です
tags:
  - introduction
  - react
---

ここから本文...
```

### 使えるフィールド

| フィールド    | 必須 | 説明                      |
| ------------- | ---- | ------------------------- |
| `title`       | Yes  | 記事タイトル              |
| `date`        | Yes  | 公開日（YYYY-MM-DD 形式） |
| `description` | No   | 記事の説明文              |
| `tags`        | No   | タグの配列                |

## 処理の流れ

### 1. `src/lib/mdx.ts` - ファイル読み込み

```tsx
// gray-matter で frontmatter とコンテンツを分離
import matter from 'gray-matter'

const fileContents = fs.readFileSync(filePath, 'utf8')
const { data, content } = matter(fileContents)
// data: { title: 'Hello World', date: '2024-01-01', ... }
// content: '## Welcome\n\nThis is my first blog post...'
```

**主な関数:**

- `getPostSlugs(type)` - 指定タイプの全スラッグを取得
- `getPostBySlug(type, slug)` - スラッグから記事を取得
- `getAllPosts(type)` - 全記事のメタデータを日付降順で取得

### 2. `src/components/mdx-content.tsx` - レンダリング

```tsx
import { transformerNotationDiff } from '@shikijs/transformers'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

export function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components} // カスタムコンポーネント
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypePrettyCode,
              {
                theme: { dark: 'github-dark', light: 'github-light' },
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
```

### カスタムコンポーネント

Markdown の要素をカスタム React コンポーネントで置き換える：

```tsx
const components = {
  h1: (props) => <h1 className="text-3xl font-bold" {...props} />,
  h2: (props) => <h2 className="text-2xl font-bold" {...props} />,
  p: (props) => <p className="my-4 leading-relaxed" {...props} />,
  code: (props) => <code className="bg-gray-100 rounded" {...props} />,
  // ...
}
```

## シンタックスハイライト

`rehype-pretty-code` と `shiki` を使用。

### 基本的な使い方

````mdx
```typescript
function greet(name: string): string {
  return `Hello, ${name}!`
}
```
````

### 設定

| オプション       | 値                                               | 説明                       |
| ---------------- | ------------------------------------------------ | -------------------------- |
| `theme`          | `{ dark: 'github-dark', light: 'github-light' }` | ライト/ダーク両対応        |
| `keepBackground` | `false`                                          | テーマの背景色を透明にする |
| `defaultLang`    | `plaintext`                                      | 言語未指定時のデフォルト   |
| `transformers`   | `[transformerNotationDiff()]`                    | diff 記法サポート          |

### diff 記法

コード内で `// [!code ++]` や `// [!code --]` を使うと、追加/削除行として表示される。

````mdx
```ts
function greet(name: string) {
  console.log('Old greeting') // [!code --]
  console.log('New greeting') // [!code ++]
}
```
````

### 使用プラグイン

- **remark-gfm**: GitHub Flavored Markdown（テーブル、取り消し線など）
- **rehype-slug**: 見出しに自動で ID を付与
- **rehype-pretty-code**: シンタックスハイライト
- **@shikijs/transformers**: diff 記法などのトランスフォーマー

## 新しい記事の追加

1. `content/blog/` または `content/note/` に `.mdx` ファイルを作成
2. frontmatter を記述
3. 本文を Markdown で記述
4. 自動的にサイトに反映される（ビルド時）

```bash
# 例: content/blog/my-new-post.mdx を作成
# -> /blog/my-new-post でアクセス可能になる
```
