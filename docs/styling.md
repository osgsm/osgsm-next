# Tailwind CSS の設定

## Tailwind CSS v4

このプロジェクトでは Tailwind CSS v4 を使用。v4 では設定が大きく簡素化された。

## 設定ファイル

### `src/app/globals.css`

```css
@import 'tailwindcss';

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

**ポイント:**

- `@import 'tailwindcss'` - v4 ではこれだけで Tailwind が有効になる
- `@theme inline` - カスタムテーマ変数の定義
- CSS 変数でダークモード対応

## よく使うユーティリティクラス

### レイアウト

```tsx
<div className="max-w-3xl mx-auto px-6">  {/* 中央揃えコンテナ */}
<div className="flex items-center justify-between">  {/* Flexbox */}
<div className="space-y-4">  {/* 子要素間の縦方向スペース */}
```

### タイポグラフィ

```tsx
<h1 className="text-4xl font-bold">  {/* 大きな見出し */}
<p className="text-gray-600 dark:text-gray-400">  {/* グレーテキスト + ダークモード */}
<span className="text-sm">  {/* 小さいテキスト */}
```

### 色とホバー

```tsx
<a className="text-blue-600 hover:underline">  {/* リンク */}
<div className="bg-gray-100 dark:bg-gray-800">  {/* 背景色 + ダークモード */}
<button className="hover:bg-gray-50">  {/* ホバー時の背景 */}
```

### ボーダーとスペース

```tsx
<div className="border rounded-lg p-4">  {/* 角丸ボーダー + パディング */}
<div className="mt-4 mb-8">  {/* マージン */}
<ul className="space-y-2">  {/* 子要素間のスペース */}
```

## ダークモード

`dark:` プレフィックスでダークモード用のスタイルを指定。

```tsx
<p className="text-gray-600 dark:text-gray-400">
  {/* ライトモード: gray-600, ダークモード: gray-400 */}
</p>

<div className="bg-white dark:bg-gray-900">
  {/* ライトモード: white, ダークモード: gray-900 */}
</div>
```

OS の設定（`prefers-color-scheme`）に自動で追従する。

## フォント

`layout.tsx` で Geist フォントを読み込み：

```tsx
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

<body className={`${geistSans.variable} ${geistMono.variable}`}>
```

`@theme inline` で Tailwind のフォント変数として登録：

```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

## レスポンシブ

ブレークポイントプレフィックスでレスポンシブ対応：

```tsx
<div className="px-4 md:px-6 lg:px-8">
  {/* デフォルト: 16px, md(768px)以上: 24px, lg(1024px)以上: 32px */}
</div>
```

| プレフィックス | 最小幅 |
| -------------- | ------ |
| `sm:`          | 640px  |
| `md:`          | 768px  |
| `lg:`          | 1024px |
| `xl:`          | 1280px |
| `2xl:`         | 1536px |
