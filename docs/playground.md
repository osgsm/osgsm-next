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

## WebGPU Image Slider Ideas

- [x] **Pixel Dissolve Slider** — ピクセル単位でランダムに溶けて次の画像に切り替わるトランジション。TSL の `hash()` で各ピクセルの切り替えタイミングをずらす。学べること: テクスチャサンプリング、`mix()` によるブレンド、ノイズ/ハッシュ関数
- [ ] **Ripple Distortion Slider** — クリック位置から波紋が広がり、波が通過した部分が次の画像に置き換わるトランジション。`sin()` と距離関数で UV 座標を歪ませる。学べること: UV ディストーション、距離ベースのエフェクト、マウスインタラクション
- [ ] **Noise Wipe Slider** — Perlin ノイズの閾値でワイプするトランジション。ノイズ値が閾値を超えた部分から次の画像が見える。`tsl-textures` の `perlinNoise` を活用。学べること: ノイズ関数の実用、`step()` / `smoothstep()` による閾値処理
- [ ] **RGB Shift Slider** — 遷移時に RGB チャンネルがそれぞれ異なる方向・速度でずれるグリッチ風トランジション。各チャンネルを個別にサンプリングして合成する。学べること: チャンネル分離、複数テクスチャサンプリング、イージング関数
- [ ] **Mosaic Flip Slider** — 画像を格子状のタイルに分割し、各タイルが時間差で裏返って次の画像になるモザイクフリップ。学べること: UV のグリッド分割、タイルベースのアニメーション、`floor()` / `fract()` の使い分け

## WebGPU デモアイデア

### 初級

- [ ] **Plasma Effect** — `sin()` / `cos()` を組み合わせたレトロなプラズマパターン。時間と UV 座標で色が波打つように変化する。学べること: 三角関数の組み合わせ、カラーパレット生成、`time` uniform の基本
- [ ] **Voronoi Pattern** — ランダムな点群からボロノイ図を生成し、各セルを色分けするパターン。点をゆっくり動かしてアニメーションさせる。学べること: 距離関数、最近傍探索、`hash()` によるランダム生成
- [ ] **Polar Kaleidoscope** — UV 座標を極座標に変換し、角度方向に繰り返しミラーリングすることで万華鏡のようなパターンを生成する。学べること: 極座標変換、`atan2()` / `mod()`、対称性の表現

### 中級

- [ ] **Raymarching Sphere** — SDF（Signed Distance Function）を使ったレイマーチングで球体をレンダリング。ライティングと影の計算を TSL で実装する。学べること: レイマーチングの基礎、SDF の概念、法線計算とフォンシェーディング
- [x] **Curl Noise Particles** — Curl Noise で動くパーティクルシステム。数千のパーティクルが流体のように滑らかに流れる。compute shader でパーティクル位置を更新する。学べること: compute shader、Curl Noise、ストレージバッファの読み書き
- [ ] **Reaction Diffusion** — Gray-Scott モデルによる反応拡散シミュレーション。2 つの化学物質の拡散と反応で有機的なパターンが自己組織化する。学べること: ping-pong バッファ、畳み込み演算、パラメータによるパターン変化
- [ ] **Audio Reactive Visualizer** — Web Audio API のアナライザーからFFTデータを取得し、周波数スペクトルに応じてジオメトリやシェーダーパラメータをリアルタイムに変化させる。学べること: 外部データの uniform 連携、FFT データの可視化、リアクティブアニメーション

### 上級

- [ ] **Fluid Simulation** — Navier-Stokes 方程式ベースの 2D 流体シミュレーション。マウスで力を加えると煙のような流れが生まれる。圧力・速度・密度の各ステップを compute shader で実装する。学べること: 流体力学の基礎、マルチパスレンダリング、compute shader の連鎖
- [ ] **Volumetric Cloud Rendering** — レイマーチングとFBMノイズを組み合わせてリアルな雲をボリュメトリックにレンダリングする。光の散乱と吸収もシミュレートする。学べること: ボリュームレンダリング、FBM ノイズの積層、光散乱モデル（Beer-Lambert 則）
- [ ] **GPU Boids Simulation** — compute shader で数万体の Boids（群れシミュレーション）を実行。分離・整列・結合の 3 ルールを GPU 上で並列計算し、インスタンスメッシュで描画する。学べること: compute shader での大規模並列処理、spatial hashing、インスタンスレンダリング
