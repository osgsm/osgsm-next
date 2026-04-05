# Curl Noise Flow Field

## 何をやっているか

16,384 個のパーティクルが 3D 空間内のカールノイズ（curl noise）ベクトル場に沿って流れるシミュレーション。パーティクルはノイズフィールドから力を受けて動き、マウスカーソルに反発し、寿命が尽きるとランダムな位置にリスポーンする。速度に応じた HSL カラーリング、位置ベースの着色、単色モードの 3 種類の描画モードを切り替えられる。OrbitControls で 3D 視点操作も可能。

## なぜ WebGPU / TSL が必要か

16,384 個のパーティクルに対して毎フレーム以下の計算を行う：

1. **カールノイズの計算**: 有限差分で 6 方向のフラクタルノイズをサンプリングし、curl（回転）を求める
2. **マウス反発力の計算**: 各パーティクルとマウス位置の距離に基づく力の計算
3. **速度・位置の更新**: 力の積分、ダンピング、位置更新
4. **寿命管理**: 寿命切れパーティクルのリスポーン

特にカールノイズは 1 パーティクルあたり 6 回のフラクタルノイズ呼び出し（各複数オクターブ）を必要とし、CPU では到底リアルタイム処理できない。WebGPU のコンピュートシェーダー（`gl.compute()`）で全パーティクルを GPU 上で並列更新する。

## GPGPU（General-Purpose GPU）パターン

このコンポーネントは ShaderCanvas を使わず、`Scene` コンポーネント + コンピュートシェーダーで実装されている。

### ShaderCanvas との違い

| 側面           | ShaderCanvas パターン            | GPGPU パターン（本コンポーネント）         |
| -------------- | -------------------------------- | ------------------------------------------ |
| レンダリング   | フルスクリーンの平面メッシュ     | `<sprite>` によるポイントスプライト        |
| GPU 計算       | フラグメントシェーダーのみ       | コンピュートシェーダー + 頂点/フラグメント |
| データ構造     | uniform のみ                     | `instancedArray` によるバッファ            |
| フレームループ | `requestAnimationFrame` 手動管理 | R3F の `useFrame`                          |
| カメラ         | OrthographicCamera（2D）         | PerspectiveCamera + OrbitControls（3D）    |

### instancedArray

```tsx
const positions = instancedArray(PARTICLE_COUNT, 'vec3')
const velocities = instancedArray(PARTICLE_COUNT, 'vec3')
const lifetimes = instancedArray(PARTICLE_COUNT, 'float')
const maxLifetimes = instancedArray(PARTICLE_COUNT, 'float')
```

`instancedArray` は GPU 上に確保されたバッファで、コンピュートシェーダーから読み書きし、レンダリングシェーダーから読み取る。CPU-GPU 間のデータ転送なしにパーティクルの状態を更新・描画できる。

## コンピュートシェーダー

### 初期化（computeInit）

```tsx
const computeInit = Fn(() => {
  const pos = positions.element(instanceIndex)
  // [-4, 4] の立方体内にランダム配置
  const hx = hash(instanceIndex).mul(8).sub(4)
  const hy = hash(instanceIndex.add(1)).mul(8).sub(4)
  const hz = hash(instanceIndex.add(2)).mul(8).sub(4)
  pos.assign(vec3(hx, hy, hz))
  vel.assign(vec3(0, 0, 0))

  // 寿命: 2〜6 秒のランダム
  const duration = hash(instanceIndex.add(3)).mul(4).add(2)
  maxLife.assign(duration)
  // 初期 life をランダムにずらして一斉リスポーンを防ぐ
  life.assign(hash(instanceIndex.add(4)).mul(duration))
})().compute(PARTICLE_COUNT)
```

- `instanceIndex` は TSL 組み込みの変数で、コンピュートシェーダー内で現在処理中のインスタンス（パーティクル）の番号を返す
- `hash(instanceIndex)` で各パーティクルにユニークなランダム値を生成。`hash(instanceIndex.add(N))` で seed をずらして x, y, z に異なる値を割り当てる
- 初期 `life` を `hash(...).mul(duration)` でランダムにずらすことで、全パーティクルが同時にリスポーンする「一斉消滅」を防ぐ

初期化は `useEffect` 内で `gl.computeAsync(computeInit)` により一度だけ実行される。

### カールノイズ（curlNoise）

カールノイズはベクトル場の「curl（回転）」を計算したもので、**発散のない（divergence-free）**ベクトル場を生成する。つまり、パーティクルの流れに「湧き出し」や「吸い込み」がなく、流体のような滑らかな動きが得られる。

#### 数学的背景

ベクトル場 **F** = (Fx, Fy, Fz) の curl は：

```
curl(F) = (∂Fz/∂y - ∂Fy/∂z, ∂Fx/∂z - ∂Fz/∂x, ∂Fy/∂x - ∂Fx/∂y)
```

ノイズ関数 N(p) は解析的な微分が困難なため、有限差分で近似する：

```
∂N/∂x ≈ (N(p + εx̂) - N(p - εx̂)) / (2ε)
```

#### TSL 実装

```tsx
const curlNoise = Fn(([pos]) => {
  const eps = float(0.01)

  // 6 方向にノイズをサンプリング
  const pxp = mx_fractal_noise_vec3(
    p.add(dx).mul(noiseScaleU),
    octaves,
    lacunarity,
    diminish
  )
  const pxn = mx_fractal_noise_vec3(
    p.sub(dx).mul(noiseScaleU),
    octaves,
    lacunarity,
    diminish
  )
  // ... pyp, pyn, pzp, pzn も同様

  const invEps2 = float(1).div(eps.mul(2))

  // curl の各成分を有限差分で計算
  const curlX = pyp.z.sub(pyn.z).sub(pzp.y.sub(pzn.y)).mul(invEps2)
  const curlY = pzp.x.sub(pzn.x).sub(pxp.z.sub(pxn.z)).mul(invEps2)
  const curlZ = pxp.y.sub(pxn.y).sub(pyp.x.sub(pyn.x)).mul(invEps2)

  return vec3(curlX, curlY, curlZ)
})
```

- `mx_fractal_noise_vec3` は MaterialX のフラクタルノイズ関数で、**vec3 を返す**。各成分が独立したノイズ値を持つ
- `octaves`（`turbulenceU`）: フラクタルノイズのオクターブ数。多いほど細かいディテールが加わる
- `lacunarity = 2.0`: 各オクターブで周波数が 2 倍になる
- `diminish = 0.5`: 各オクターブで振幅が半分になる
- `eps = 0.01`: 有限差分の刻み幅。小さすぎると数値誤差、大きすぎると精度低下

#### なぜ curl なのか

通常のノイズ場（gradient noise）をそのまま力として使うと、パーティクルが勾配の「谷」に集まって停滞する。curl を取ることで：

1. **発散なし**: パーティクルが一箇所に集まらない
2. **渦状の流れ**: 自然で有機的な動きが得られる
3. **滑らかさ**: Perlin ノイズの滑らかさが curl にも引き継がれる

### 更新（computeUpdate）

```tsx
const computeUpdate = Fn(() => {
  // 1. ノイズ位置に時間オフセットを加える（ノイズ場の時間発展）
  const noisePos = pos.add(vec3(0, 0, time.mul(evolutionSpeedU)))

  // 2. カールノイズ力を計算して速度に加算
  const curl = curlNoise(noisePos)
  vel.addAssign(curl.mul(dt).mul(2.0))

  // 3. マウス反発力
  const toParticle = pos.sub(mousePosU)
  const dist = toParticle.length().max(0.001)
  const falloff = float(1).sub(dist.div(repelRadiusU).clamp(0, 1))
  const repelForce = toParticle
    .normalize()
    .mul(falloff.mul(falloff).mul(repelStrengthU).mul(dt))
  vel.addAssign(repelForce)

  // 4. ダンピング（速度減衰）
  vel.mulAssign(dampingU)

  // 5. 位置更新
  pos.addAssign(vel.mul(dt))

  // 6. 寿命チェック → リスポーン
  life.subAssign(dt)
  If(life.lessThan(0), () => {
    /* ランダム位置にリスポーン */
  })
})().compute(PARTICLE_COUNT)
```

#### ステップ 1: ノイズ場の時間発展

```
noisePos = pos + vec3(0, 0, time * evolutionSpeed)
```

パーティクルの実位置に `time` を Z 方向のオフセットとして加える。これにより、同じ位置でも時間が経つと異なるノイズ値がサンプリングされ、ベクトル場全体がゆっくり変化する。`evolutionSpeed = 0` にするとノイズ場が固定され、パーティクルは同じ軌道を繰り返す。

#### ステップ 2: 力の適用

```
vel += curl * dt * 2.0
```

curl ベクトルを力として速度に加算する。`dt` を掛けることでフレームレートに依存しない（時間積分）。`2.0` は力の強さを調整する定数。

#### ステップ 3: マウス反発

```
falloff = (1 - clamp(dist / repelRadius, 0, 1))²
repelForce = normalize(toParticle) * falloff * repelStrength * dt
```

- `toParticle`: マウス位置からパーティクルへの方向ベクトル
- `dist.max(0.001)`: ゼロ除算防止
- `falloff`: 距離が `repelRadius` 以内で 1〜0 に減衰する二次関数。`falloff * falloff` で二乗減衰にすることで、中心に近いほど急激に強くなる
- `normalize(toParticle)`: 反発方向（マウスから離れる方向）

#### ステップ 4: ダンピング

```
vel *= damping  // デフォルト 0.98
```

毎フレーム速度を 2% 減衰させる。これがないとパーティクルが際限なく加速し、制御不能になる。1.0 にすると減衰なし（エネルギー保存）、0.9 にすると強い減衰（粘性の高い流体）。

#### ステップ 5–6: 位置更新とリスポーン

寿命が尽きたパーティクルは `[-4, 4]` の立方体内のランダム位置にリスポーンする。リスポーン時の seed に `time.mul(1000)` を含めることで、同じ `instanceIndex` でも毎回異なるランダム位置が得られる。

## マウスインタラクション

```tsx
<mesh
  visible={false}
  onPointerMove={(e) => {
    e.stopPropagation()
    mouseWorld.current.copy(e.point)
  }}
  onPointerLeave={() => {
    mouseWorld.current.set(9999, 9999, 9999)
  }}
>
  <planeGeometry args={[100, 100]} />
  <meshBasicMaterial />
</mesh>
```

不可視の巨大な平面（100x100）を配置し、R3F の `onPointerMove` でレイキャスト結果のワールド座標を取得する。この座標をマウス位置として GPU に渡す。

`onPointerLeave` でマウスが離れたら座標を `(9999, 9999, 9999)` に飛ばすことで、全パーティクルが `repelRadius`（デフォルト 3.0）の外に出て、反発力が 0 になる。

## カラーリング

3 つのカラーモードを uniform で切り替える：

### velocity モード（デフォルト）

速度ベクトルから HSL カラーを計算する：

```tsx
const hue = atan(vel.y, vel.x)
  .div(Math.PI * 2)
  .add(0.5) // 速度の方向 → 色相
const lightness = float(0.5).add(speed.mul(0.1).clamp(0, 0.3)) // 速度の大きさ → 明度
```

- **色相**: 速度ベクトルの `atan2(y, x)` で方向を角度に変換し、0〜1 に正規化。右方向が赤、上方向が緑、左方向がシアン…と方向ごとに異なる色になる
- **彩度**: 固定 0.7
- **明度**: 基準 0.5 に速度の大きさを加算。速いパーティクルほど明るく光る

HSL → RGB 変換はシェーダー内で `hslToRgb` 関数として実装。`abs(hue*6 - k)` パターンで各色チャンネルの三角波を近似している。

### position モード

```tsx
const posNorm = positions.element(instanceIndex).mul(0.15).add(0.5)
const posColor = vec3(posNorm.x.fract(), posNorm.y.fract(), posNorm.z.fract())
```

3D 位置を直接 RGB にマッピング。`fract()` でラップアラウンドさせて 0〜1 に収める。

### single モード

```tsx
const singleColor = vec3(0.6, 0.7, 1.0) // ソフトブルー
```

全パーティクルが同じ色。加算ブレンディングにより密集部分が白く光る。

### フェードイン/アウト

```tsx
const fadeIn = lifeRatio.oneMinus().smoothstep(0, 0.1) // 生まれたて → フェードイン
const fadeOut = lifeRatio.smoothstep(0, 0.2) // 寿命末期 → フェードアウト
const fade = fadeIn.mul(fadeOut)
```

`lifeRatio` = 残り寿命 / 最大寿命。1.0 で生まれたて、0.0 で寿命切れ。

- `fadeIn`: `1 - lifeRatio` が 0→0.1 の区間（≈ lifeRatio 0.9→1.0）でフェードイン
- `fadeOut`: `lifeRatio` が 0→0.2 の区間でフェードアウト

この fade 値はサイズ、不透明度、色の明るさすべてに適用される。

## レンダリング

```tsx
const mat = new PointsNodeMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: false,
})
mat.positionNode = positions.element(instanceIndex)
mat.colorNode = finalColor.mul(float(0.5).add(fade.mul(0.5)))
mat.sizeNode = particleSizeU.mul(float(0.3).add(fade.mul(0.7)))
mat.opacityNode = opacityU.mul(fade)
```

- **PointsNodeMaterial**: TSL ノードベースのポイントマテリアル
- **AdditiveBlending**: 重なり合う部分が加算合成され、密集部分が白く光る
- **depthWrite: false**: 半透明パーティクルの前後関係による描画順の問題を回避
- **sizeAttenuation: false**: カメラからの距離に関わらず一定サイズ（画面スペースでのピクセルサイズ）

`<sprite>` 要素にマテリアルを設定し、`mesh.count = PARTICLE_COUNT` で描画数を指定する。

## Leva コントロール

| パラメータ       | デフォルト | 範囲     | 効果                                                 |
| ---------------- | ---------- | -------- | ---------------------------------------------------- |
| `noiseScale`     | 0.1        | 0.1〜3   | ノイズ場の空間スケール。大きいほど渦が小さく密になる |
| `evolutionSpeed` | 0.15       | 0〜1     | ノイズ場の時間変化速度。0 で静的なフィールド         |
| `turbulence`     | 3          | 1〜6     | フラクタルノイズのオクターブ数。多いほど複雑な流れ   |
| `speed`          | 1.0        | 0〜3     | シミュレーション全体の時間スケール                   |
| `damping`        | 0.98       | 0.9〜1.0 | 速度の減衰率。低いほど粘性が高い                     |
| `repelStrength`  | 5.0        | 0〜10    | マウス反発力の強さ                                   |
| `repelRadius`    | 3.0        | 0.1〜5   | マウス反発が効く半径                                 |
| `colorMode`      | `velocity` | 3 択     | カラーリングモード（velocity / position / single）   |
| `opacity`        | 0.85       | 0〜1     | パーティクル全体の不透明度                           |
| `particleSize`   | 1.5        | 1.0〜5   | パーティクルのサイズ（ピクセル）                     |

## ファイル構成

```
src/app/(playground)/playground/flow-field/
├── flow-field.tsx         # メインコンポーネント（コンピュートシェーダー + レンダリング + インタラクション）
├── flow-field-loader.tsx  # dynamic import ラッパー（SSR 無効化）
└── page.tsx               # Next.js ページ（metadata + レイアウト）
```

## particles との違い

| 側面            | particles                        | flow-field                             |
| --------------- | -------------------------------- | -------------------------------------- |
| パーティクル数  | 50,000                           | 16,384                                 |
| 駆動力          | アトラクター（マウスに引き寄せ） | カールノイズ場（流体的な流れ）         |
| マウスの役割    | 引き寄せ（attractor）            | 反発（repel）                          |
| 配置空間        | 球状のランダム分布               | 立方体のランダム分布                   |
| カメラ操作      | 固定（OrbitControls なし）       | OrbitControls で 3D 視点操作可能       |
| カラーモード    | 単色（uniform）                  | 3 種類（velocity / position / single） |
| ノイズ計算      | なし                             | カールノイズ（6 回のフラクタルノイズ） |
| sizeAttenuation | true（奥行きで縮小）             | false（一定サイズ）                    |
