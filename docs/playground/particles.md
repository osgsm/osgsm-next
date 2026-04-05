# GPGPU Particles

## 何をやっているか

50,000 個のパーティクルがマウスカーソル（アトラクター）に引き寄せられるリアルタイムシミュレーション。パーティクルはアトラクターからの逆二乗の引力と重力を受けて運動し、寿命が尽きるとアトラクター付近にリスポーンする。WebGPU のコンピュートシェーダーで全パーティクルを GPU 上で並列更新する GPGPU パターンの実装。

## なぜ WebGPU / TSL が必要か

50,000 個のパーティクルに対して毎フレーム以下の計算を行う：

1. アトラクターまでの距離と方向の計算
2. 逆二乗の引力 + 重力の計算
3. 速度・位置の更新（オイラー積分）
4. 寿命管理とリスポーン

CPU で 50,000 個の物理演算を毎フレーム行うと数 fps しか出ないが、GPU のコンピュートシェーダーなら全パーティクルを完全並列に処理できるため 60fps が維持できる。さらに、位置データが GPU バッファ上にあるためレンダリング時の CPU→GPU 転送が不要。

## GPGPU パターン

flow-field と同じく `Scene` コンポーネント + コンピュートシェーダーで実装されている。ShaderCanvas（フルスクリーン平面 + フラグメントシェーダー）ではなく、`<points>` 要素 + `PointsNodeMaterial` でパーティクルを描画する。

### instancedArray

```tsx
const positions = instancedArray(PARTICLE_COUNT, 'vec3')
const velocities = instancedArray(PARTICLE_COUNT, 'vec3')
const lifetimes = instancedArray(PARTICLE_COUNT, 'float')
const maxLifetimes = instancedArray(PARTICLE_COUNT, 'float')
```

GPU 上のストレージバッファ。各パーティクルの位置、速度、残り寿命、最大寿命を保持する。コンピュートシェーダーから読み書き可能で、レンダリングシェーダーからも直接読み取れる。

## コンピュートシェーダー

### 初期化（computeInit）

```tsx
const computeInit = Fn(() => {
  // 球面座標でランダム配置（半径 0〜8）
  const r = hash(instanceIndex).mul(8)
  const theta = hash(instanceIndex.add(1)).mul(Math.PI * 2) // 方位角
  const phi = hash(instanceIndex.add(2)).mul(Math.PI) // 極角

  pos.x.assign(r.mul(phi.sin()).mul(theta.cos()))
  pos.y.assign(r.mul(phi.sin()).mul(theta.sin()))
  pos.z.assign(r.mul(phi.cos()))

  vel.assign(vec3(0, 0, 0))

  // 寿命: 1〜4 秒のランダム
  const duration = hash(instanceIndex.add(3)).mul(3).add(1)
  maxLife.assign(duration)
  life.assign(hash(instanceIndex.add(4)).mul(duration))
})().compute(PARTICLE_COUNT)
```

**球面座標系でのランダム配置**:

```
x = r * sin(φ) * cos(θ)
y = r * sin(φ) * sin(θ)
z = r * cos(φ)
```

- `r`: 半径（0〜8）。原点からの距離をランダムに決める
- `θ`（theta）: 方位角（0〜2π）。XY 平面上の回転角
- `φ`（phi）: 極角（0〜π）。Z 軸からの傾き

**flow-field との違い**: flow-field は `[-4, 4]` の立方体内に直交座標で配置するが、particles は球面座標で配置する。球面座標の方が初期配置が球状に広がり、原点のアトラクターに向かって吸い込まれる見た目が自然になる。

**注意**: この方式では `r` と `phi` が一様分布のため、厳密には球面上の均一分布にはならない（極付近に偏る）。ただしパーティクル数が多く動きも速いため、視覚的には問題にならない。

### 更新（computeUpdate）

```tsx
const computeUpdate = Fn(() => {
  // 1. アトラクターへの引力
  const toAttractor = attractorPos.sub(pos)
  const distance = toAttractor.length()
  const direction = toAttractor.normalize()
  const force = direction
    .mul(attractorStrengthU)
    .div(distance.mul(distance).add(1.0))
  vel.addAssign(force.mul(dt))

  // 2. 重力
  vel.y.addAssign(gravityU.mul(dt))

  // 3. ダンピング
  vel.mulAssign(dampingU)

  // 4. 位置更新
  pos.addAssign(vel.mul(dt))

  // 5. 寿命チェック → リスポーン
  life.subAssign(dt)
  If(life.lessThan(0), () => {
    /* アトラクター付近にリスポーン */
  })
})().compute(PARTICLE_COUNT)
```

#### ステップ 1: アトラクターへの引力

```
force = normalize(toAttractor) * strength / (distance² + 1.0)
```

逆二乗の引力。`distance² + 1.0` の `+ 1.0` はソフニングファクターで、パーティクルがアトラクターに近づきすぎた時の力の発散（無限大）を防ぐ。

- `distance = 0` のとき: `force = strength / 1.0 = strength`（有限値に留まる）
- `distance >> 1` のとき: `force ≈ strength / distance²`（古典的な逆二乗則）

ソフニングなしだと `distance → 0` で力が `∞` に発散し、パーティクルが一瞬で飛び去ってしまう。

#### ステップ 2: 重力

```
vel.y += gravity * dt    // デフォルト gravity = -0.5
```

Y 軸方向の一定の下向きの力。アトラクターの引力と重力のバランスにより、パーティクルが完全にアトラクターに集まらず、下方に流れ落ちる動きが生まれる。`gravity` を正にすると上向きの浮力になる。

#### ステップ 3: ダンピング

```
vel *= damping    // デフォルト 1.0
```

デフォルトが 1.0（減衰なし）であることに注目。flow-field（0.98）とは異なり、エネルギーが保存される設定。アトラクターの引力がパーティクルにエネルギーを与え続けるため、ダンピングを 1.0 にしても視覚的に破綻しない。0.9 に下げると粘性の高い流体のようにゆっくりした動きになる。

#### ステップ 4–5: 位置更新とリスポーン

寿命切れのパーティクルは**アトラクター付近**（半径 0〜2 の球内）にリスポーンする：

```tsx
pos.x.assign(attractorPos.x.add(r.mul(phi.sin()).mul(theta.cos())))
pos.y.assign(attractorPos.y.add(r.mul(phi.sin()).mul(theta.sin())))
pos.z.assign(attractorPos.z.add(r.mul(phi.cos())))
```

flow-field はランダムな立方体内にリスポーンするが、particles はアトラクター（マウス位置）付近にリスポーンする。これにより、マウスの周りに新しいパーティクルが常に生まれ続け、カーソルから放射されるような見た目になる。

## マウスインタラクション

```tsx
const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

useFrame(() => {
  raycaster.setFromCamera(pointer, camera)
  raycaster.ray.intersectPlane(intersectPlane, intersectPoint)
  uniforms.attractorPos.value.copy(intersectPoint)
})
```

R3F の `pointer`（正規化デバイス座標: -1〜1）から `raycaster` でレイを飛ばし、Z=0 平面との交点をワールド座標で求める。この座標をアトラクター位置として GPU に渡す。

**flow-field との違い**: flow-field は不可視メッシュの `onPointerMove` でワールド座標を取得するが、particles は `useFrame` 内で毎フレームレイキャストを行う。結果は同じだが、particles の方がイベントドリブンではなくポーリング的。

## レンダリング

```tsx
const mat = new PointsNodeMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true,
})
mat.positionNode = positions.element(instanceIndex)
mat.colorNode = colorU.mul(float(0.3).add(lifeRatio.mul(0.7)))
mat.sizeNode = particleSizeU.mul(float(0.2).add(lifeRatio.mul(0.8)))
mat.opacityNode = opacityU.mul(lifeRatio.smoothstep(0, 0.3))
```

### sizeAttenuation

`sizeAttenuation: true` は particles 独自の設定。パースペクティブカメラの深度に応じてパーティクルサイズが縮小する。奥のパーティクルが小さく見えることで、3D 空間の奥行き感が出る。flow-field は `false`（画面上で一定サイズ）。

### 色と寿命

```tsx
mat.colorNode = colorU.mul(float(0.3).add(lifeRatio.mul(0.7)))
```

`lifeRatio` = 残り寿命 / 最大寿命。1.0 で生まれたて（明るい）、0.0 で寿命切れ（暗い）。

- 生まれたて（lifeRatio=1.0）: `color * (0.3 + 0.7) = color * 1.0`（フルカラー）
- 寿命末期（lifeRatio=0.0）: `color * (0.3 + 0.0) = color * 0.3`（暗い）

不透明度は `lifeRatio.smoothstep(0, 0.3)` で寿命の最後 30% でフェードアウトする。

**flow-field との違い**: flow-field はフェードイン/アウトの両方がある（生まれたてもフェードイン）が、particles はフェードアウトのみ。flow-field は 3 種類のカラーモードがあるが、particles は単色の uniform カラーのみ。

### ジオメトリ

```tsx
const geo = new THREE.BufferGeometry()
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3))
geo.drawRange.count = 1
geo.computeBoundingSphere()
geo.boundingSphere!.radius = 1000
```

`<points>` は最低 1 頂点のジオメトリが必要。ダミーの 1 頂点ジオメトリを作成し、実際の位置は `positionNode`（GPU バッファ）から取得する。`boundingSphere.radius = 1000` は巨大な値に設定し、フラスタムカリング（視野外のオブジェクトを描画しない最適化）を事実上無効化している。`frustumCulled={false}` と同じ効果だが、ジオメトリレベルで制御している。

**flow-field との違い**: flow-field は `<sprite>` 要素で描画しているが、particles は `<points>` + カスタムジオメトリ。`<sprite>` はジオメトリを自動で持つが、`<points>` は明示的なジオメトリが必要。

## Leva コントロール

| パラメータ          | デフォルト | 範囲     | 効果                                                       |
| ------------------- | ---------- | -------- | ---------------------------------------------------------- |
| `attractorStrength` | 10         | 0〜50    | アトラクターの引力の強さ。高いほどパーティクルが速く集まる |
| `gravity`           | -0.5       | -5〜5    | Y 方向の重力。負で下向き、正で上向き                       |
| `damping`           | 1.0        | 0.9〜1.0 | 速度の減衰率。1.0 で減衰なし、低いほど粘性が高い           |
| `speed`             | 1.0        | 0〜3     | シミュレーション全体の時間スケール                         |
| `color`             | `#5b5bd6`  | カラー   | パーティクルの色                                           |
| `opacity`           | 1.0        | 0〜1     | パーティクル全体の不透明度                                 |

## ファイル構成

```
src/app/(playground)/playground/particles/
├── particles.tsx         # メインコンポーネント（コンピュートシェーダー + レンダリング + インタラクション）
├── particles-loader.tsx  # dynamic import ラッパー（SSR 無効化）
└── page.tsx              # Next.js ページ（metadata + レイアウト）
```

## flow-field との比較

| 側面             | particles                          | flow-field                             |
| ---------------- | ---------------------------------- | -------------------------------------- |
| パーティクル数   | 50,000                             | 16,384                                 |
| 駆動力           | アトラクター（逆二乗の引力）+ 重力 | カールノイズ場                         |
| マウスの役割     | 引き寄せ（attractor）              | 反発（repel）                          |
| 初期配置         | 球面座標（球状分布）               | 直交座標（立方体分布）                 |
| リスポーン位置   | アトラクター付近（半径 2）         | ランダム（立方体全体）                 |
| カメラ操作       | 固定（OrbitControls なし）         | OrbitControls で 3D 視点操作可能       |
| カラー           | 単色 uniform                       | 3 種類（velocity / position / single） |
| フェード         | フェードアウトのみ                 | フェードイン + フェードアウト          |
| sizeAttenuation  | true（奥行きで縮小）               | false（一定サイズ）                    |
| ダンピング初期値 | 1.0（減衰なし）                    | 0.98（微減衰）                         |
| 描画要素         | `<points>` + カスタムジオメトリ    | `<sprite>`                             |
| ノイズ計算       | なし                               | カールノイズ（6 回のフラクタルノイズ） |
| 計算コスト       | 軽い（距離と方向の計算のみ）       | 重い（フラクタルノイズ × 6）           |
