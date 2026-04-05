# Noise Gradient

## 何をやっているか

Perlin ノイズを使って 2 色間のグラデーションをリアルタイムに生成する背景エフェクト。ベースとなるノイズに細かい粒状のノイズを重ねることで、有機的で奥行き感のあるテクスチャを生み出す。`time` を Z 軸にマッピングすることでノイズがゆっくりと変化し続ける。

## なぜ WebGPU / TSL が必要か

画面上の全ピクセルに対して毎フレーム Perlin ノイズを 2 回（ベース + 微細）計算する。ノイズ関数は内部で複数のオクターブの補間を行うため計算コストが高い。CPU ベースの Canvas 2D では 60fps を維持できないが、GPU のフラグメントシェーダーなら全ピクセルを完全並列で処理できる。

## シェーダーロジック

### 核心部分（TSL）

```tsx
// 1. ベースノイズの位置：UV + 時間を Z 軸に
const pos = vec3(uv(), time.mul(uSpeed).mul(0.1))

// 2. ベースの Perlin ノイズ（tsl-textures ライブラリ）
const baseNoise = perlinNoise({
  position: pos,
  scale: uScale,
  balance: uBalance,
  contrast: uContrast,
  color: uColor1,
  background: uColor2,
  seed: uSeed,
})

// 3. 微細ノイズの位置：UV をスケールアップ + 時間を半分の速度で
const finePos = vec3(uv().mul(uFineNoiseScale), time.mul(uSpeed).mul(0.05))

// 4. 微細 Perlin ノイズ（別の seed）
const fineNoise = perlinNoise({
  position: finePos,
  scale: float(1),
  balance: float(0),
  contrast: float(0),
  color: uColor1,
  background: uColor2,
  seed: uSeed.add(42),
})

// 5. ベースと微細ノイズをブレンド
return mix(baseNoise, fineNoise, uFineNoiseIntensity)
```

### 各ステップの解説

#### ステップ 1–2: ベースノイズ

```
pos = vec3(uv(), time * speed * 0.1)
```

UV 座標（0〜1 の 2D）に `time` を Z 成分として追加し、3D ノイズ空間上のスライスとしてサンプリングする。時間が進むと Z 方向にスライスが移動するため、ノイズパターンが滑らかに変化する。

`tsl-textures` の `perlinNoise` は以下のパラメータを受け取る：

- `position`: ノイズ空間内の座標（vec3）
- `scale`: ノイズの空間的な大きさ。大きいほどパターンが粗くなる
- `balance`: ノイズの中央値をシフトする。正の値で明るい色（color1）が優勢になる
- `contrast`: ノイズのコントラスト。正の値でくっきり、負の値でぼんやりする
- `color` / `background`: ノイズ値 1.0 / 0.0 にマッピングする色
- `seed`: ノイズパターンのシード値。異なる seed で異なるパターンが得られる

#### ステップ 3–4: 微細ノイズ

```
finePos = vec3(uv() * fineNoiseScale, time * speed * 0.05)
```

UV を `fineNoiseScale`（デフォルト 200）倍にスケールアップして、非常に細かいノイズを生成する。映画のフィルムグレインに似た質感を加えるレイヤー。

重要なポイント：

- **スケールが異なる**: ベースノイズの `uScale`（デフォルト 1）に対して、微細ノイズは 200 倍のスケール
- **時間の進みが半分**: `0.05` vs ベースの `0.1`。微細ノイズが速く動きすぎるとちらつきになるため
- **seed をずらす**: `uSeed.add(42)` でベースとは異なるパターンを生成。同じ seed だとベースのパターンと相関が出てしまう
- **scale/balance/contrast は固定**: 微細ノイズ自体は均一な分布が望ましいため、パラメータを中立値にしている

#### ステップ 5: ブレンド

```
mix(baseNoise, fineNoise, uFineNoiseIntensity)
```

`mix(a, b, t)` = `a * (1 - t) + b * t`。`uFineNoiseIntensity`（デフォルト 0.15）により、ベースノイズを主体としつつ微細ノイズを 15% ブレンドする。0 にすると滑らかなベースノイズのみ、1 にすると微細ノイズのみが表示される。

## tsl-textures ライブラリ

`perlinNoise` は [tsl-textures](https://www.npmjs.com/package/tsl-textures) パッケージから import している。このライブラリは three.js TSL 向けのプロシージャルテクスチャ関数を提供し、Perlin ノイズ以外にも Voronoi、Simplex などの関数がある。

内部では TSL ノードグラフとして展開されるため、通常の TSL 関数と同様にシェーダー内でインライン化される。ランタイムのオーバーヘッドはない。

## uniform の更新パターン

このコンポーネントでは uniform をモジュールスコープで宣言し、Leva の値変更を `useEffect` で uniform に反映している：

```tsx
const uScale = uniform(1)  // モジュールスコープ

// コンポーネント内
const { scale } = useControls({ ... })

useEffect(() => {
  uScale.value = scale
}, [scale])
```

各パラメータに対して個別の `useEffect` があるのは、`useMemo` 内でシェーダーノードグラフを構築する際に uniform 参照が固定されている必要があるため。Leva の値が変わるたびに uniform の `.value` だけを更新し、ノードグラフの再構築は避けている。

**pixel-dissolve / ripple-distortion との違い**: それらは `useMemo` 内で uniform を宣言しているが、noise-gradient はモジュールスコープで宣言している。どちらも「uniform 参照は固定、値だけ更新」という原則は同じだが、宣言場所が異なる。

## ShaderCanvas との関係

`createColorNodeAction` コールバックを ShaderCanvas に渡す。ShaderCanvas は `resolution` と `mouse` の uniform を提供するが、noise-gradient は `resolution` も `mouse` も使用しない。UV 座標のみで完結するエフェクトのため。

## Leva コントロール

| パラメータ           | デフォルト | 範囲     | 効果                                                     |
| -------------------- | ---------- | -------- | -------------------------------------------------------- |
| `scale`              | 1          | 0〜4     | ノイズの空間スケール。大きいほどパターンが粗くなる       |
| `balance`            | -0.1       | -3〜3    | ノイズの中央値シフト。正で color1 寄り、負で color2 寄り |
| `contrast`           | 0          | -2〜2    | ノイズのコントラスト                                     |
| `color1`             | `#4a4a95`  | カラー   | ノイズ値が高い部分の色                                   |
| `color2`             | `#202248`  | カラー   | ノイズ値が低い部分の色                                   |
| `seed`               | 0          | 0〜100   | ノイズパターンのシード                                   |
| `speed`              | 1.0        | 0〜3     | ノイズの時間変化速度                                     |
| `fineNoiseScale`     | 200        | 100〜300 | 微細ノイズの空間スケール                                 |
| `fineNoiseIntensity` | 0.15       | 0〜1     | 微細ノイズの混合比率                                     |

## ファイル構成

```
src/app/(playground)/playground/noise-gradient/
├── noise-gradient.tsx         # メインコンポーネント（シェーダーノード構築 + uniform 管理）
├── noise-gradient-loader.tsx  # dynamic import ラッパー（SSR 無効化）
└── page.tsx                   # Next.js ページ（metadata + レイアウト）
```
