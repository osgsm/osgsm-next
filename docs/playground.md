# Playground システム

## 概要

Playground は、Three.js / R3F を使ったインタラクティブな 3D・シェーダー実験をホストするセクション。ハブページ（カード一覧）と個別フルスクリーンページの 2 層構成になっている。

## ディレクトリ構造

```
src/
├── app/
│   ├── (main)/playground/         # ハブページ（メインレイアウト内）
│   │   └── page.tsx
│   └── (playground)/playground/   # 個別ページ（専用レイアウト）
│       ├── layout.tsx
│       ├── cube/page.tsx
│       └── gradient/page.tsx
├── components/playground/
│   ├── scene.tsx                   # 3D シーン共通コンポーネント
│   ├── shader-canvas.tsx           # TSL シェーダー共通コンポーネント
│   ├── cube/index.tsx
│   └── gradient/index.tsx
public/images/playground/           # サムネイル画像
```

## Route Groups によるレイアウト分離

同じ URL パス `/playground` でも、ハブページと個別ページで異なるレイアウトを適用するために **Route Groups** を使用している。

| Route Group    | レイアウト                                      | 用途                         |
| -------------- | ----------------------------------------------- | ---------------------------- |
| `(main)`       | Header + Footer + `max-w-3xl` のコンテンツ幅    | ハブページ `/playground`     |
| `(playground)` | 「← Back to playground」リンクのみのミニマル UI | 個別ページ（フルスクリーン） |

Route Group のフォルダ名（括弧付き）は URL に影響しない。

## ハブページ

`src/app/(main)/playground/page.tsx` にある `items` 配列でカード一覧を生成する。

```tsx
const items = [
  {
    title: 'Cube',
    description: 'A spinning cube with interactive controls',
    href: '/playground/cube',
    thumbnail: '/images/playground/cube.gif',
  },
  {
    title: 'Gradient',
    description: 'Animated gradient shader with TSL',
    href: '/playground/gradient',
    thumbnail: null, // null の場合は "Preview" プレースホルダー表示
  },
]
```

## 個別ページのパターン

各個別ページは `'use client'` + `next/dynamic` で SSR を無効化し、コンポーネントを動的インポートする。

```tsx
'use client'

import dynamic from 'next/dynamic'

const CubeScene = dynamic(
  () => import('@/components/playground/cube').then((mod) => mod.CubeScene),
  { ssr: false }
)

export default function CubePage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <CubeScene />
    </div>
  )
}
```

SSR を無効化する理由については [three-webgpu.md](./three-webgpu.md#ssr-無効化が必要な理由) を参照。

## 共有コンポーネント

### `Scene`

3D オブジェクト（メッシュ、ライトなど）を配置するためのラッパー。`Canvas`, `OrbitControls`, `Leva` をまとめて提供する。

| Props           | 型                                                | デフォルト                             | 説明                        |
| --------------- | ------------------------------------------------- | -------------------------------------- | --------------------------- |
| `children`      | `ReactNode`                                       | （必須）                               | シーン内の 3D 要素          |
| `camera`        | `ComponentProps<typeof Canvas>['camera']`         | `{ position: [2.5, 2, 3.5], fov: 50 }` | カメラ設定                  |
| `gl`            | `ComponentProps<typeof Canvas>['gl']`             | `{ antialias: true }`                  | レンダラー設定              |
| `className`     | `string`                                          | `'relative h-full'`                    | ラッパー div のクラス       |
| `orbitControls` | `boolean \| ComponentProps<typeof OrbitControls>` | `true`                                 | OrbitControls の有効化/設定 |
| `leva`          | `ComponentProps<typeof Leva>`                     | —                                      | Leva パネルの設定           |

### `ShaderCanvas`

TSL（Three.js Shading Language）でシェーダーを書くためのラッパー。WebGPU レンダラー、正射影カメラ、resolution/mouse uniform を内蔵している。

| Props                   | 型                                             | デフォルト          | 説明                  |
| ----------------------- | ---------------------------------------------- | ------------------- | --------------------- |
| `createColorNodeAction` | `(params: { resolution, mouse }) => ColorNode` | （必須）            | カラーノード生成関数  |
| `leva`                  | `ComponentProps<typeof Leva>`                  | —                   | Leva パネルの設定     |
| `className`             | `string`                                       | `'relative h-full'` | ラッパー div のクラス |

詳細は [three-webgpu.md](./three-webgpu.md) を参照。

## 新しいアイテムの追加手順

### 1. コンポーネントを作成

`src/components/playground/<name>/index.tsx` に実装を書く。

```tsx
'use client'

import { Scene } from '@/components/playground/scene'

function MyObject() {
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export function MyScene() {
  return (
    <Scene>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <MyObject />
    </Scene>
  )
}
```

### 2. ページを作成

`src/app/(playground)/playground/<name>/page.tsx` を作成。

```tsx
'use client'

import dynamic from 'next/dynamic'

const MyScene = dynamic(
  () => import('@/components/playground/<name>').then((mod) => mod.MyScene),
  { ssr: false }
)

export default function MyPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <MyScene />
    </div>
  )
}
```

### 3. ハブページに追加

`src/app/(main)/playground/page.tsx` の `items` 配列にエントリを追加。

```tsx
{
  title: 'My Item',
  description: 'Description of my item',
  href: '/playground/<name>',
  thumbnail: '/images/playground/<name>.gif', // または null
}
```

### 4. サムネイル画像を配置（任意）

`public/images/playground/<name>.gif` にサムネイルを置く。指定しない場合はプレースホルダーが表示される。
