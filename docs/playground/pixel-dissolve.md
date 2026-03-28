# Pixel Dissolve Slider

## 何をやっているか

4 枚の写真をピクセル単位でランダムに「溶かして」切り替えるトランジションエフェクト。各ピクセルが独立したタイミングで次の画像に切り替わるため、全体としてノイズが広がるように遷移する。自動再生に加えて、キーボードの左右矢印キーで手動ナビゲーションもできる。

## なぜ WebGPU / TSL が必要か

1920x1080 の画面には約 200 万ピクセルある。各ピクセルに対して「ランダム閾値の生成 → 閾値と進捗の比較 → 2 枚のテクスチャのブレンド」を毎フレーム実行する必要がある。CPU（Canvas 2D API）でやると数 fps しか出ない。GPU のフラグメントシェーダーなら全ピクセルが完全並列で処理されるため 60fps が余裕で出る。

## シェーダーロジック

### 核心部分（TSL）

```tsx
// 1. ピクセル座標を求める
const pixelCoord = uv().mul(resolution).div(uPixelScale).floor()

// 2. ピクセルごとにユニークなランダム値を生成し、[softness, 1-softness] にリマップ
const seed = pixelCoord.x.add(pixelCoord.y.mul(float(10000)))
const threshold = hash(seed)
  .mul(float(1).sub(uSoftness.mul(2)))
  .add(uSoftness)

// 3. progress（0→1）と threshold を比較してブレンド率を決める
const blend = smoothstep(
  threshold.sub(uSoftness),
  threshold.add(uSoftness),
  uProgress
)

// 4. 2 枚のテクスチャをブレンド
return mix(texNodeA, texNodeB, blend)
```

### 各ステップの解説

#### ステップ 1: ピクセル座標の算出

```
uv()             → 0.0〜1.0 の連続値（フラグメントの正規化座標）
.mul(resolution) → 0〜1920, 0〜1080 などの実ピクセル座標に変換
.div(uPixelScale)→ pixelScale > 1 のとき座標を粗くする（ブロック状のディゾルブ）
.floor()         → 小数を切り捨てて離散的なピクセル座標にする
```

`floor()` が重要。これがないと隣接ピクセルで微妙に異なる連続値になり、ディゾルブが「ノイズ」ではなく「グラデーション」になってしまう。`floor()` で同一ピクセル内の全フラグメントが同じ座標値を持つようにすることで、ピクセル単位の切り替えが実現する。

#### ステップ 2: hash によるランダム閾値

```
seed = x + y * 10000
rawThreshold = hash(seed)  → 0.0〜1.0
threshold = rawThreshold * (1 - softness * 2) + softness  → softness〜(1 - softness)
```

`hash()` は TSL 組み込みの疑似ランダム関数。引数（seed）が同じなら毎フレーム同じ値を返す。これが重要で、ピクセルごとの閾値がフレーム間で変わらないからこそ「あるピクセルが早く切り替わり、別のピクセルが遅く切り替わる」という安定したパターンが得られる。

`y * 10000` は x と y を 1 次元に畳み込むための定数。画面幅より十分大きければ衝突しない。

**threshold のリマップが必要な理由:** `hash()` の生の値（0〜1）をそのまま使うと、threshold が 1.0 に近いピクセルで `threshold + softness > 1.0` となり、`smoothstep` の上端が progress の最大値 1.0 を超えてしまう。結果、progress=1.0 でもブレンドが完了せず、前の画像が部分的に残る。threshold の範囲を `[softness, 1-softness]` に収めることで、smoothstep のエッジが常に [0, 1] 内に収まり、全ピクセルが確実に完全遷移する。

#### ステップ 3: smoothstep によるブレンド

```
smoothstep(threshold - softness, threshold + softness, progress)
```

`progress` が 0→1 に進むにつれて、`threshold` が低いピクセルから先にブレンドが始まる。

- `softness = 0`: 各ピクセルが瞬時に切り替わる（ハードエッジ）
- `softness = 0.5`: 広い範囲のピクセルが同時に徐々にフェードする（ソフト）

`smoothstep` は GLSL/TSL の組み込み関数で、エルミート補間を行う：

```
smoothstep(edge0, edge1, x):
  t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
```

#### ステップ 4: テクスチャのブレンド

```
mix(texNodeA, texNodeB, blend)
```

`mix(a, b, t)` = `a * (1 - t) + b * t`。`blend` が 0 のとき texA、1 のとき texB が表示される。

## テクスチャの扱い

### 読み込み

```tsx
const textures = useMemo(() => {
  const loader = new TextureLoader()
  return IMAGE_PATHS.map((path) => {
    const tex = loader.load(path)
    tex.colorSpace = SRGBColorSpace
    return tex
  })
}, [])
```

`TextureLoader.load()` は非同期だが `Texture` オブジェクトを即座に返す（中身は後から埋まる）。`SRGBColorSpace` を設定しないと色がリニア空間で解釈されて暗く見える。

### TSL テクスチャノード

```tsx
const texNodeA = useMemo(() => texture(textures[0]), [textures])
```

`texture()` は TSL の関数で、`TextureNode` を生成する。引数なしで UV 指定を省略すると、自動的に `uv()` でサンプリングされる。

### テクスチャの動的切り替え

```tsx
texNodeA.value = textures[newIndex]
```

`TextureNode` は内部的に `UniformNode` を継承しており、`.value` プロパティでテクスチャ参照を差し替えられる。シェーダーグラフの再構築なしにテクスチャが切り替わる。

## アニメーションとナビゲーション

### アーキテクチャ

ShaderCanvas パターンでは `useFrame`（R3F のフック）にアクセスできないため、コンポーネントレベルで `requestAnimationFrame` を使う。アニメーション状態は `useRef` で保持し、自動再生とキーボード操作の両方から同じ状態を参照する。

```tsx
const stateRef = useRef({
  currentIdx: 0, // 現在表示中の画像インデックス
  phase: 'hold' as 'hold' | 'transition', // 現在のフェーズ
  startTime: performance.now(), // フェーズ開始時刻
  direction: 1 as 1 | -1, // 遷移方向（1: 次, -1: 前）
})
```

`useState` ではなく `useRef` を使う理由：状態更新のたびに React の再レンダリングが走ると、rAF ループ内で毎フレーム再レンダリングが発生してパフォーマンスが悪化する。ref なら値の更新が React のレンダリングサイクルを通らないため、60fps のループ内で安全に読み書きできる。

### goTo 関数：トランジションの起点

```tsx
const goTo = useCallback(
  (direction: 1 | -1) => {
    const s = stateRef.current
    if (s.phase === 'transition') return // トランジション中は無視

    const nextIdx =
      (s.currentIdx + direction + textures.length) % textures.length
    texNodeA.value = textures[s.currentIdx] // 現在の画像
    texNodeB.value = textures[nextIdx] // 遷移先の画像
    s.direction = direction
    s.phase = 'transition'
    s.startTime = performance.now()
  },
  [textures, texNodeA, texNodeB]
)
```

自動再生（hold タイマー満了時）とキーボード操作の両方がこの関数を呼ぶ。トランジション中に再度呼ばれた場合は早期リターンで二重遷移を防止する。

### キーボードナビゲーション

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(1)
    else if (e.key === 'ArrowLeft') goTo(-1)
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [goTo])
```

`ArrowRight` で次の画像、`ArrowLeft` で前の画像へ遷移する。`goTo` 内のガードにより、トランジション中のキー連打は無視される。

### 状態遷移フロー

```
hold フェーズ:
  - progress = 0 を維持（現在の画像を静止表示）
  - holdTime 秒経過 → goTo(1) で自動的に次へ
  - キーボード入力 → goTo(+/-1) で手動遷移

transition フェーズ:
  - progress を 0→1 にアニメーション（duration = 1/speed 秒）
  - キーボード入力は無視（二重遷移防止）
  - progress が 1 に達したら:
    - currentIdx を direction 方向に更新
    - texNodeA に遷移先の画像をセット（次の hold で表示する画像）
    - progress を 0 にリセット
    - hold フェーズへ戻る（hold タイマーもリセット）
```

### テクスチャ入れ替えのタイミング

テクスチャの入れ替えは 2 箇所で起きる：

1. **トランジション開始時（goTo）**: texNodeA = 現在の画像、texNodeB = 遷移先の画像
2. **トランジション完了時（animate）**: texNodeA = 遷移先の画像（hold 中に表示する画像として）

完了時に texNodeA だけ更新するのは、hold フェーズでは progress=0 → `mix(texNodeA, texNodeB, 0)` = texNodeA が表示されるため。texNodeB は次の goTo 呼び出しで改めてセットされる。

## Leva コントロール

| パラメータ   | デフォルト | 範囲   | 効果                                                            |
| ------------ | ---------- | ------ | --------------------------------------------------------------- |
| `speed`      | 0.5        | 0.2〜3 | トランジション速度。高いほど速く溶ける                          |
| `softness`   | 0.1        | 0〜0.5 | ディゾルブのエッジの柔らかさ。0 でハード、0.5 で全体がフェード  |
| `pixelScale` | 3          | 1〜20  | ディゾルブの粒度。1 で真のピクセル単位、20 で大きなブロック単位 |
| `holdTime`   | 2.0        | 0.5〜5 | 画像が静止している時間（秒）                                    |

## ファイル構成

```
src/app/(playground)/playground/pixel-dissolve/
├── pixel-dissolve.tsx         # メインコンポーネント（シェーダー + アニメーション + キーボード）
├── pixel-dissolve-loader.tsx  # dynamic import ラッパー（SSR 無効化）
└── page.tsx                   # Next.js ページ（metadata + レイアウト）
```

既存の gradient / noise-gradient と同じ 3 ファイルパターンに従っている。

## ShaderCanvas との関係

ShaderCanvas は `createColorNodeAction` コールバックで TSL のカラーノードを受け取り、`MeshBasicNodeMaterial.colorNode` に設定する。このコンポーネントはそのコールバック内でテクスチャサンプリングとディゾルブブレンドを組み立てている。

ShaderCanvas が提供する `resolution` uniform をピクセル座標の計算に使っている。`mouse` uniform は今回は不使用。

## 学んだこと / 注意点

- `texture()` で生成される `TextureNode` は `.value` でテクスチャを差し替えられる
- `hash()` はフレーム間で同じ seed に対して同じ値を返す（時間依存しない）
- `floor()` で離散化しないとピクセル単位のエフェクトにならない
- `SRGBColorSpace` を設定しないとテクスチャの色が暗くなる
- ShaderCanvas 外からアニメーションを制御するには `requestAnimationFrame` + uniform 更新が使える
- `smoothstep` の範囲が progress の [0, 1] を超えないよう threshold をリマップする必要がある
- rAF ループ内の状態は `useRef` で持つ（`useState` だと毎フレーム再レンダリングが走る）
- 自動再生と手動操作を共存させるには、共通の `goTo` 関数を用意してどちらからも呼べるようにする
