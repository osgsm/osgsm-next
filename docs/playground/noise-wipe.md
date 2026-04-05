# Noise Wipe Slider

## 何をやっているか

4 枚の写真を Perlin ノイズベースの「ワイプ」で切り替えるトランジションエフェクト。単純な直線ワイプではなく、ノイズ関数で生成された不規則な閾値マップに基づいてピクセルごとに切り替わるため、有機的で自然な遷移が得られる。自動再生に加えて、キーボードの左右矢印キーで手動ナビゲーションもできる。

## なぜ WebGPU / TSL が必要か

各ピクセルに対して「Perlin ノイズのサンプリング → 閾値のリマップ → progress との比較 → 2 枚のテクスチャのブレンド」を毎フレーム実行する。Perlin ノイズは内部で補間やグラデーション計算を伴う重い処理であり、約 200 万ピクセルの並列処理には GPU フラグメントシェーダーが必須。

## シェーダーロジック

### 核心部分（TSL）

```tsx
// 1. Cover UV の計算（object-fit: cover 相当）
const canvasAspect = resolution.x.div(resolution.y)
const scaleX = tslMin(float(1.0), canvasAspect.div(uImageAspect))
const scaleY = tslMin(float(1.0), uImageAspect.div(canvasAspect))
const coverUv = uv().sub(0.5).mul(vec2(scaleX, scaleY)).add(0.5)

// 2. Perlin ノイズで閾値マップを生成
const noisePos = vec3(uv().mul(uNoiseScale), float(0))
const noiseVal = mx_noise_float(noisePos).mul(0.5).add(0.5)

// 3. threshold を [softness, 1-softness] にリマップ
const threshold = noiseVal.mul(float(1).sub(uSoftness.mul(2))).add(uSoftness)

// 4. smoothstep でブレンド率を計算
const blend = smoothstep(
  threshold.sub(uSoftness),
  threshold.add(uSoftness),
  uProgress
)

// 5. テクスチャ選択とブレンド
return mix(colorA, colorB, blend)
```

### 各ステップの解説

#### ステップ 1: Cover UV

```
scaleX = min(1.0, canvasAspect / imageAspect)
scaleY = min(1.0, imageAspect / canvasAspect)
coverUv = (uv - 0.5) * vec2(scaleX, scaleY) + 0.5
```

CSS の `object-fit: cover` をシェーダー内で再現する。画像のアスペクト比とキャンバスのアスペクト比が異なる場合、はみ出す方向を縮小して中央に配置する。

- キャンバスが画像より横長: `scaleY < 1` → UV の Y 方向を縮小（上下をトリミング）
- キャンバスが画像より縦長: `scaleX < 1` → UV の X 方向を縮小（左右をトリミング）
- 同じアスペクト比: 両方 1.0 でそのまま

`uv().sub(0.5)` で原点を中央に移し、スケーリング後に `.add(0.5)` で戻すことで、トリミングが中央基準になる。

`uImageAspect` は最初の画像の読み込み完了時にコールバックで設定される：

```tsx
const tex = loader.load(path, (loaded) => {
  if (i === 0 && loaded.image) {
    uImageAspect.value = loaded.image.width / loaded.image.height
  }
})
```

#### ステップ 2: Perlin ノイズによる閾値マップ

```
noisePos = vec3(uv * noiseScale, 0)
noiseVal = mx_noise_float(noisePos) * 0.5 + 0.5
```

`mx_noise_float` は three.js 組み込みの MaterialX Perlin ノイズ関数で、-1〜1 の値を返す。`* 0.5 + 0.5` で 0〜1 にリマップする。

- `uNoiseScale`（デフォルト 2.0）で UV を拡大してからノイズをサンプリング。値が大きいほどノイズパターンが細かくなり、ワイプの境界が複雑になる
- Z 成分は `float(0)` 固定。時間変化しない静的なノイズパターンを使うことで、トランジション中にノイズ自体が動かず、安定したワイプが得られる

**pixel-dissolve との違い**: pixel-dissolve は `hash()` で完全にランダムな閾値を生成するのに対し、noise-wipe は Perlin ノイズで空間的に連続した閾値を生成する。Perlin ノイズは隣接ピクセル間の値が滑らかに変化するため、ワイプの境界が有機的な曲線を描く。

#### ステップ 3: threshold のリマップ

```
threshold = noiseVal * (1 - softness * 2) + softness
```

pixel-dissolve と同じリマップ。noiseVal の範囲 [0, 1] を [softness, 1-softness] に線形マッピングする。

**なぜ必要か**: `smoothstep(threshold - softness, threshold + softness, progress)` において、threshold が 0 や 1 に近いと smoothstep のエッジが [0, 1] の範囲を超える。例えば threshold=0.98, softness=0.05 なら上端は 1.03 となり、progress=1.0 でもブレンドが完了しない。リマップにより、全ピクセルが progress=0→1 の範囲内で確実に完全遷移する。

#### ステップ 4: smoothstep によるブレンド

```
smoothstep(threshold - softness, threshold + softness, progress)
```

`progress` が 0→1 に進むにつれて、`threshold` が低いピクセルから先にブレンドが始まる。Perlin ノイズは空間的に連続しているため、隣接するピクセルの threshold が近い値を持ち、ワイプの境界が滑らかな曲線になる。

- `softness = 0`: 各ピクセルが瞬時に切り替わる（ノイズパターンのハードエッジ）
- `softness = 0.5`: 広い範囲が同時に徐々にフェードする

#### ステップ 5: テクスチャ選択

pixel-dissolve と同じ `pickTex` パターンを使用。`step` + `mix` のチェーンで uniform インデックスに基づいてテクスチャを選択する。詳細は pixel-dissolve のドキュメントを参照。

## mx_noise_float と hash の比較

| 特性         | `mx_noise_float`（Perlin ノイズ）    | `hash`（疑似ランダム）           |
| ------------ | ------------------------------------ | -------------------------------- |
| 出力範囲     | -1〜1（リマップして 0〜1）           | 0〜1                             |
| 空間的連続性 | あり（隣接ピクセル間で滑らかに変化） | なし（完全にランダム）           |
| 入力         | vec3（3D ノイズ空間）                | float（1D シード）               |
| 結果の見た目 | 有機的な曲線の境界                   | 砂のようなランダムな境界         |
| 計算コスト   | 高い（補間 + グラデーション計算）    | 低い（単純なハッシュ関数）       |
| ユースケース | 自然な遷移、地形生成、雲             | ピクセル単位のランダムエフェクト |

## アニメーションとナビゲーション

pixel-dissolve と同じアーキテクチャを使用。詳細は pixel-dissolve のドキュメントを参照。

### 状態管理

```tsx
const stateRef = useRef({
  currentIdx: 0,
  phase: 'hold' as 'hold' | 'transition',
  startTime: 0,
  direction: 1 as 1 | -1,
})
```

`useRef` で状態を保持し、`requestAnimationFrame` ループ内から直接読み書きする。React の再レンダリングサイクルを経由しないため、60fps のアニメーションループ内で安全にアクセスできる。

### goTo 関数

自動再生の hold タイマー満了時とキーボード操作の両方から呼ばれる。トランジション中の呼び出しは早期リターンで無視し、二重遷移を防止する。

### 状態遷移フロー

```
hold → (holdTime 経過 or キー入力) → transition → (progress=1) → hold
```

hold フェーズでは progress=0 を維持し、`mix(colorA, colorB, 0)` = colorA が表示される。transition フェーズでは progress を 0→1 にアニメーションし、完了時に `currentIdx` を更新して hold に戻る。

## Leva コントロール

| パラメータ   | デフォルト | 範囲    | 効果                                                             |
| ------------ | ---------- | ------- | ---------------------------------------------------------------- |
| `speed`      | 0.8        | 0.2〜3  | トランジション速度。高いほど速くワイプが進む                     |
| `softness`   | 0.05       | 0〜0.5  | ワイプ境界の柔らかさ。0 でハードエッジ、0.5 で全体がフェード     |
| `noiseScale` | 2.0        | 0.5〜10 | ノイズの空間スケール。大きいほどパターンが細かく境界が複雑になる |
| `holdTime`   | 2.0        | 0.5〜5  | 画像が静止している時間（秒）                                     |

## ファイル構成

```
src/app/(playground)/playground/noise-wipe/
├── noise-wipe.tsx         # メインコンポーネント（シェーダー + アニメーション + キーボード）
├── noise-wipe-loader.tsx  # dynamic import ラッパー（SSR 無効化）
└── page.tsx               # Next.js ページ（metadata + レイアウト）
```

## pixel-dissolve との違い

| 側面             | pixel-dissolve                       | noise-wipe                           |
| ---------------- | ------------------------------------ | ------------------------------------ |
| 閾値の生成       | `hash()`（完全ランダム）             | `mx_noise_float()`（Perlin ノイズ）  |
| 境界の見た目     | 砂状のランダムなピクセル             | 有機的な曲線の境界                   |
| ピクセル制御     | `uPixelScale` でブロックサイズ調整可 | ピクセル単位（ブロック化なし）       |
| ノイズスケール   | なし                                 | `uNoiseScale` で境界の複雑さを調整可 |
| 追加 uniform     | uSoftness, uPixelScale               | uSoftness, uNoiseScale, uImageAspect |
| ノイズ関数の入力 | 1D（x + y \* 10000）                 | 3D（vec3）                           |
| cover UV         | なし（直接 uv()使用の可能性）        | あり（アスペクト比補正）             |
