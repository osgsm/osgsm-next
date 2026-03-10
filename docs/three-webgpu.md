# R3F・Three.js TSL・WebGPU

## 依存パッケージ

| パッケージ           | バージョン | 用途                                         |
| -------------------- | ---------- | -------------------------------------------- |
| `three`              | ^0.183     | 3D レンダリングエンジン（WebGPU / TSL 含む） |
| `@react-three/fiber` | ^9.5       | Three.js の React バインディング（R3F）      |
| `@react-three/drei`  | ^10.7      | R3F 向けヘルパーコンポーネント集             |
| `leva`               | ^0.10      | リアルタイムパラメータ調整 UI                |

## インポートのエントリポイント

Three.js v0.183 以降では、機能ごとにエントリポイントが分離されている。

```tsx
// 標準 Three.js（型・クラス全般）
import { Color, Mesh, Vector2 } from 'three'

// WebGPU レンダラー & ノードマテリアル
import { WebGPURenderer, MeshBasicNodeMaterial } from 'three/webgpu'

// TSL（Three.js Shading Language）関数
import { uniform, uv, time, mix, sin } from 'three/tsl'
```

**注意:** `three/webgpu` と `three/tsl` を混同しないこと。レンダラーやノードマテリアルは `three/webgpu` から、シェーダー構築関数は `three/tsl` からインポートする。

## 型に関する注意点

### `WebGPURenderer` は named export

```tsx
// ✅ 正しい
import { WebGPURenderer } from 'three/webgpu'

// ❌ default export ではない
import WebGPURenderer from 'three/webgpu'
```

### `ColorNode` の型推論

`MeshBasicNodeMaterial['colorNode']` を使って `colorNode` の型を導出する。

```tsx
type ColorNode = NonNullable<MeshBasicNodeMaterial['colorNode']>
```

`UniformNode` の型は `three/webgpu` から再エクスポートされていないため、直接参照が必要な場合は `@types/three/src/nodes/core/UniformNode.d.ts` を確認する。

## WebGPU レンダラーの初期化

R3F の `Canvas` コンポーネントの `gl` prop に async ファクトリ関数を渡す。**`renderer.init()` は非同期なので必ず `await` する。**

```tsx
<Canvas
  gl={async (props) => {
    const renderer = new WebGPURenderer(props as any)
    await renderer.init()
    return renderer
  }}
>
  {/* ... */}
</Canvas>
```

## TSL（Three.js Shading Language）

TSL はノードベースでシェーダーを組み立てるための DSL。GLSL/WGSL を直接書く代わりに、JavaScript/TypeScript のメソッドチェーンで記述できる。

### 主要関数

| 関数        | インポート元   | 説明                                       |
| ----------- | -------------- | ------------------------------------------ |
| `uniform()` | `three/tsl`    | CPU から更新可能な値（色、数値、ベクトル） |
| `uv()`      | `three/tsl`    | UV 座標（0〜1）を返すノード                |
| `time`      | `three/tsl`    | 経過時間（秒）を返すノード                 |
| `mix()`     | `three/tsl`    | 2 つの値を補間（GLSL の `mix` と同等）     |
| `sin()`     | `three/tsl`    | サイン関数                                 |
| `.mul()`    | ノードメソッド | 乗算（`a.mul(b)` = `a * b`）               |
| `.add()`    | ノードメソッド | 加算（`a.add(b)` = `a + b`）               |

### ノード組み合わせの実例

`gradient/index.tsx` の `createColorNode` を段階的に解説する。

```tsx
const t = sin(time.mul(uSpeed).add(uv().y.mul(3.0)))
  .mul(0.5)
  .add(0.5)
return mix(uColor1, uColor2, t)
```

| ステップ | コード                     | 説明                                    |
| -------- | -------------------------- | --------------------------------------- |
| 1        | `time.mul(uSpeed)`         | 経過時間にスピード係数を掛ける          |
| 2        | `uv().y.mul(3.0)`          | UV の Y 座標を 3 倍に伸ばす             |
| 3        | `.add(...)`                | ステップ 1 + ステップ 2 で位相をずらす  |
| 4        | `sin(...)`                 | -1〜1 の範囲で振動させる                |
| 5        | `.mul(0.5).add(0.5)`       | -1〜1 を 0〜1 にリマップ                |
| 6        | `mix(uColor1, uColor2, t)` | 2 色の間を `t` で補間（グラデーション） |

## `uniform` の使い方

### 作成

```tsx
import { uniform } from 'three/tsl'
import { Color } from 'three'

const uColor1 = uniform(new Color('#6e56cf')) // Color uniform
const uSpeed = uniform(0.5) // 数値 uniform
```

### `.value` での更新

uniform は `.value` プロパティで実行時に更新できる。再レンダリングなしにシェーダーの値が変わる。

```tsx
// Color の場合は .value.set()
uColor1.value.set('#e54666')

// 数値の場合は .value に代入
uSpeed.value = 1.0
```

### Leva との連携

Leva コントロールの値が変わったら `useEffect` で uniform を更新する。

```tsx
const { color1, speed } = useControls({
  Gradient: folder({
    color1: '#6e56cf',
    speed: { value: 0.5, min: 0, max: 3, step: 0.1 },
  }),
})

useEffect(() => {
  uColor1.value.set(color1)
}, [color1])

useEffect(() => {
  uSpeed.value = speed
}, [speed])
```

## `ShaderCanvas` の内部構造

`src/components/playground/shader-canvas.tsx` は TSL シェーダーを簡単に使うための共通コンポーネント。

### 構成要素

1. **WebGPU レンダラー** — `Canvas` の `gl` prop で async 初期化
2. **正射影カメラ** — 1x1 の平面にぴったり合う設定
   ```tsx
   <OrthographicCamera
     makeDefault
     manual
     left={-0.5}
     right={0.5}
     top={0.5}
     bottom={-0.5}
     near={0.1}
     far={10}
     position={[0, 0, 1]}
   />
   ```
3. **resolution / mouse uniform** — ビューポートサイズとマウス座標を自動追跡
4. **`MeshBasicNodeMaterial`** — `createColorNodeAction` の戻り値を `colorNode` に設定
5. **クリーンアップ** — `useEffect` の cleanup でマテリアルを `dispose()`

### 使い方

```tsx
import { ShaderCanvas } from '@/components/playground/shader-canvas'

function MyShader() {
  const createColorNode = useCallback(({ resolution, mouse }) => {
    // TSL ノードを組み立てて返す
    return mix(color1, color2, uv().x)
  }, [])

  return <ShaderCanvas createColorNodeAction={createColorNode} />
}
```

`createColorNodeAction` は `{ resolution, mouse }` を引数に受け取る。これらは `uniform(Vector2)` で、シェーダー内でビューポートサイズやマウス位置を参照できる。

## `Scene` コンポーネント

3D オブジェクトを配置するための汎用ラッパー。Props の詳細は [playground.md](./playground.md#scene) を参照。

### WebGPU レンダラーとの併用

`gl` prop にファクトリ関数を渡すことで WebGPU を使用できる。

```tsx
import { WebGPURenderer } from 'three/webgpu'

;<Scene
  gl={async (props) => {
    const renderer = new WebGPURenderer(props as any)
    await renderer.init()
    return renderer
  }}
  leva={{ titleBar: { title: 'My Controls' } }}
>
  <ambientLight intensity={0.4} />
  <MyMesh />
</Scene>
```

## Leva の使い方

[Leva](https://github.com/pmndrs/leva) はリアルタイムにパラメータを調整するための GUI パネル。

### 基本

```tsx
import { useControls, folder } from 'leva'

const { color, speed } = useControls({
  Appearance: folder({
    color: '#6e56cf', // カラーピッカー
    speed: { value: 0.5, min: 0, max: 3 }, // スライダー
  }),
})
```

### UI ウィジェット対応表

| 値の型 / 指定方法                           | UI ウィジェット        |
| ------------------------------------------- | ---------------------- |
| `'#ffffff'`                                 | カラーピッカー         |
| `true` / `false`                            | トグル                 |
| `{ value: 0.5, min: 0, max: 1 }`            | スライダー             |
| `{ value: 0.5, min: 0, max: 1, step: 0.1 }` | ステップ付きスライダー |
| `folder({ ... })`                           | 折りたたみグループ     |

### `Scene` / `ShaderCanvas` での Leva 設定

両コンポーネントとも `leva` prop で `<Leva>` の props を渡せる。

```tsx
<Scene leva={{ titleBar: { title: 'Cube Controls' } }}>
```

## SSR 無効化が必要な理由

Three.js（特に WebGPU 関連）はブラウザ API（`canvas`, `navigator.gpu` など）に依存するため、サーバーサイドでは実行できない。そのため個別ページでは `next/dynamic` + `{ ssr: false }` を使う。

```tsx
const CubeScene = dynamic(
  () => import('@/components/playground/cube').then((mod) => mod.CubeScene),
  { ssr: false }
)
```

## トラブルシューティング

| 問題                                  | 原因                               | 対処法                                                   |
| ------------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `navigator is not defined`            | SSR で Three.js を実行しようとした | `dynamic()` + `{ ssr: false }` を使う                    |
| `WebGPURenderer is not a constructor` | default import している            | `import { WebGPURenderer } from 'three/webgpu'` に修正   |
| `renderer.init is not a function`     | 古い Three.js バージョン           | `three` を ^0.183 以上に更新する                         |
| `colorNode` の型エラー                | 型推論が合わない                   | `NonNullable<MeshBasicNodeMaterial['colorNode']>` を使う |
| uniform の値が反映されない            | `.value` を更新していない          | Color は `.value.set()`、数値は `.value = x`             |
| ナビゲーション時に dispose エラー     | nodeBuilderState がクリア済み      | `try/catch` で dispose を囲む                            |
