# プロジェクト構成

## ディレクトリ構造

```
osgsm-next/
├── src/                    # ソースコード
│   ├── app/                # Next.js App Router（ページとレイアウト）
│   ├── components/         # 再利用可能なコンポーネント
│   └── lib/                # ユーティリティ関数
├── content/                # MDX コンテンツファイル
│   ├── blog/               # ブログ記事
│   └── note/               # ノート
├── public/                 # 静的ファイル
├── docs/                   # このドキュメント
└── 設定ファイル群
```

## 各ディレクトリの役割

### `src/app/`

Next.js の App Router を使用。ファイルベースのルーティングで、フォルダ構造がそのまま URL パスになる。

| ファイル      | 役割                                       |
| ------------- | ------------------------------------------ |
| `page.tsx`    | ルートに対応するページコンポーネント       |
| `layout.tsx`  | 共通レイアウト（ネストされたページに適用） |
| `globals.css` | グローバルスタイル                         |

### `src/components/`

再利用可能な React コンポーネントを配置。

- `mdx-content.tsx` - MDX をレンダリングするコンポーネント

### `src/lib/`

ビジネスロジックやユーティリティ関数。

- `mdx.ts` - MDX ファイルの読み込み・パース処理

### `content/`

MDX 形式のコンテンツファイル。`src/` の外に配置することで、コンテンツとコードを分離している。

### `public/`

静的アセット（画像、フォント、favicon など）。`/public/image.png` は `/image.png` でアクセス可能。

## 設定ファイル

| ファイル             | 説明                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| `next.config.ts`     | Next.js の設定                                                         |
| `tsconfig.json`      | TypeScript の設定。`@/*` で `src/*` を参照できるパスエイリアス設定あり |
| `eslint.config.mjs`  | ESLint の設定                                                          |
| `postcss.config.mjs` | PostCSS の設定（Tailwind CSS に必要）                                  |
| `package.json`       | 依存関係とスクリプト                                                   |

## パスエイリアス

`tsconfig.json` で設定されているパスエイリアス：

```typescript
// これは
import { getAllPosts } from '@/lib/mdx'

// これと同じ
import { getAllPosts } from '../../../lib/mdx'
```

`@/` は `src/` ディレクトリを指す。深いネストでも簡潔にインポートできる。
