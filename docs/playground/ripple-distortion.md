# Ripple Distortion Slider

## 何をやっているか

4 枚の写真をクリック位置から波紋が広がるエフェクトで切り替えるトランジション。波紋が通過した部分が次の画像に置き換わり、波紋の先端付近では `sin()` による UV ディストーション（歪み）が発生する。自動再生に加えて、クリックで波紋の中心を指定でき、矢印キーでもナビゲーションできる。

## なぜ WebGPU / TSL が必要か

各ピクセルに対して「中心からの距離計算 → 波紋到達判定 → sin による UV 歪み → 2 枚のテクスチャのブレンド」を毎フレーム実行する。約 200 万ピクセルの並列処理は GPU フラグメントシェーダーでないと 60fps を維持できない。

## シェーダーロジック

### 核心部分（TSL）

```tsx
// 1. 波紋の中心からの距離を計算（アスペクト比補正で正円に）
const screenUv = uv()
const toCenter = screenUv.sub(uRippleCenter)
const corrected = toCenter.mul(vec2(canvasAspect, float(1.0)))
const distance = length(corrected)

// 2. progress に基づく波紋の到達位置
const maxRadius = float(1.5)
const waveFront = uProgress.mul(maxRadius)
const distFromFront = distance.sub(waveFront)

// 3. 波紋先端付近で sin による UV 歪み（トランジション両端でフェード）
const decay = float(8.0)
const progressFade = uProgress.mul(float(1.0).sub(uProgress)).mul(4.0)
const distortion = sin(distFromFront.mul(uRippleFrequency))
  .mul(uRippleAmplitude)
  .mul(exp(abs(distFromFront).mul(decay).negate()))
  .mul(progressFade)
const direction = normalize(toCenter)
const distortedUv = coverUv.add(direction.mul(distortion))

// 4. 波紋が通過した部分は画像 B に切り替え
const softEdge = float(0.02)
const blend = smoothstep(
  waveFront.add(softEdge),
  waveFront.sub(softEdge),
  distance
)
return mix(colorA, colorB, blend)
```

### 各ステップの解説

#### ステップ 1: 距離の計算

```
screenUv = uv()                        → 画面空間の UV（0〜1）
toCenter = screenUv - rippleCenter     → 波紋中心からの方向ベクトル
corrected = toCenter * vec2(aspect, 1) → X 方向をアスペクト比で伸張
distance = length(corrected)           → 補正済みの距離（正円になる）
```

`uRippleCenter` はクリック位置を正規化 UV 座標（0〜1）で保持する。キーボード操作時は中央 `(0.5, 0.5)` がセットされる。距離計算にはテクスチャ座標 `coverUv` ではなく画面空間の `uv()` を使う。クリック座標が画面 UV 空間なので、同じ空間で距離を計算しないと波紋の中心がずれる。

さらに、画面 UV 空間は X 方向が圧縮されている（横長画面では UV の 0〜1 が物理的に広い）ため、`toCenter` の X 成分にキャンバスのアスペクト比 (`resolution.x / resolution.y`) を掛けて補正する。これがないと波紋が縦長の楕円になる。

#### ステップ 2: 波紋の到達位置

```
waveFront = progress * maxRadius
distFromFront = distance - waveFront
```

`progress` が 0→1 に進むと `waveFront` が 0→1.5 に広がる。`maxRadius = 1.5` は画面の対角線をカバーするのに十分な値。`distFromFront` が負の領域は波紋が通過済み、正の領域はまだ到達していない。

#### ステップ 3: sin による UV ディストーション

```
progressFade = progress * (1 - progress) * 4
distortion = sin(distFromFront * frequency) * amplitude * exp(-|distFromFront| * decay) * progressFade
```

- `sin(distFromFront * frequency)`: 波紋の先端付近で振動するサイン波
- `amplitude`: 振幅（UV 空間での歪みの強さ）
- `exp(-|distFromFront| * decay)`: 波紋の先端から離れるほど指数的に減衰
- `progressFade`: トランジションの両端（progress=0, 1）で歪みを 0 にするフェード係数

`progressFade = progress * (1 - progress) * 4` は progress=0.5 で最大値 1.0、両端で 0 になる放物線。これがないと hold フェーズ（progress=0）でも `exp(-distance * decay)` による残留歪みが発生し、トランジション終了後にクリック位置付近の画像が歪んだままになる。

この歪みを `normalize(toCenter)` 方向に適用することで、波紋中心から放射状に UV がずれる。結果として、波紋の先端付近でレンズのような歪みが生まれる。

`decay` が大きいほど歪みが波紋先端の狭い範囲に集中する。`amplitude` を 0 にすると歪みなしの単純な円形ワイプになる。

#### ステップ 4: ブレンド

```
blend = smoothstep(waveFront + softEdge, waveFront - softEdge, distance)
```

`smoothstep` の引数の順番に注意：第 1 引数 > 第 2 引数のとき、`smoothstep` は反転する。つまり `distance < waveFront` の領域で `blend = 1`（画像 B を表示）、`distance > waveFront` の領域で `blend = 0`（画像 A を表示）となる。`softEdge` で境界をぼかす。

## クリックインタラクション

ShaderCanvas が提供する `mouse` uniform はマウス移動（mousemove）のみ対応しているため、クリック位置は独自の `uRippleCenter` uniform で管理する。

```tsx
const handleClick = (e: MouseEvent) => {
  const rect = container.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = 1.0 - (e.clientY - rect.top) / rect.height // Y 軸反転
  uRippleCenter.value.set(x, y)
  goTo(1)
}
```

DOM のクリック座標を正規化 UV（0〜1、左下原点）に変換する。Y 軸は DOM（上が 0）と UV（下が 0）で反転しているため `1.0 -` で補正する。

## テクスチャの扱い

pixel-dissolve と同じ画像セットを共有し、同じ `pickTex` パターンでインデックスベースのテクスチャ選択を行う。ただし、distorted UV でサンプリングするため、`pickTex` 関数が UV を引数として受け取る形に拡張している。

## Leva コントロール

| パラメータ        | デフォルト | 範囲   | 効果                                         |
| ----------------- | ---------- | ------ | -------------------------------------------- |
| `speed`           | 0.5        | 0.2〜3 | トランジション速度。高いほど速く波紋が広がる |
| `holdTime`        | 2.0        | 0.5〜5 | 画像が静止している時間（秒）                 |
| `rippleFrequency` | 12         | 2〜40  | 波の周波数。高いほど波紋の縞が細かくなる     |
| `rippleAmplitude` | 0.03       | 0〜0.1 | 波の振幅。高いほど UV 歪みが強くなる         |

## ファイル構成

```
src/app/(playground)/playground/ripple-distortion/
├── ripple-distortion.tsx         # メインコンポーネント（シェーダー + アニメーション + クリック）
├── ripple-distortion-loader.tsx  # dynamic import ラッパー（SSR 無効化）
└── page.tsx                      # Next.js ページ（metadata + レイアウト）
```

## pixel-dissolve との違い

| 側面               | pixel-dissolve         | ripple-distortion                                 |
| ------------------ | ---------------------- | ------------------------------------------------- |
| トランジションの形 | ランダムなピクセル単位 | 中心から広がる円形波紋                            |
| UV 歪み            | なし                   | 波紋先端で sin による放射状歪み                   |
| ユーザー操作       | キーボードのみ         | クリック（位置指定）+ キーボード                  |
| 追加 uniform       | uSoftness, uPixelScale | uRippleCenter, uRippleFrequency, uRippleAmplitude |
| ブレンド方式       | hash 閾値 vs progress  | 距離 vs waveFront（smoothstep）                   |
