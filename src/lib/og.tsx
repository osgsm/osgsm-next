import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'
import type { PostType } from './mdx'

const WIDTH = 1200
const HEIGHT = 630

const TYPE_LABEL: Record<PostType, string> = {
  blog: 'blog',
  note: 'note',
}

const TYPE_DESCRIPTION: Record<PostType, string> = {
  blog: 'Lessons learned, written down',
  note: 'Messy notes for future me',
}

// Radix iris colors (dark theme used for OGP)
const IRIS_1 = '#13131e'
const IRIS_2 = '#171625'
const IRIS_10 = '#6E6ADE'
const IRIS_11 = '#b1a9ff'
const IRIS_12 = '#e0dffe'

async function loadFonts() {
  const geistBold = await readFile(
    join(
      process.cwd(),
      'node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf'
    )
  )

  const geistRegular = await readFile(
    join(
      process.cwd(),
      'node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf'
    )
  )

  const notoSansBold = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap'
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(/src:\s*url\(([^)]+)\)/)
      return match ? fetch(match[1]).then((res) => res.arrayBuffer()) : null
    })

  const geistPixelCircle = await readFile(
    join(process.cwd(), 'src/assets/fonts/GeistPixel-Circle.ttf')
  )

  const notoSansRegular = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap'
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(/src:\s*url\(([^)]+)\)/)
      return match ? fetch(match[1]).then((res) => res.arrayBuffer()) : null
    })

  return [
    { name: 'Geist Sans', data: geistBold, weight: 700 as const },
    { name: 'Geist Sans', data: geistRegular, weight: 400 as const },
    ...(notoSansBold
      ? [{ name: 'Noto Sans JP', data: notoSansBold, weight: 700 as const }]
      : []),
    ...(notoSansRegular
      ? [
          {
            name: 'Noto Sans JP',
            data: notoSansRegular,
            weight: 400 as const,
          },
        ]
      : []),
    {
      name: 'Geist Pixel Circle',
      data: geistPixelCircle,
      weight: 400 as const,
    },
  ]
}

async function loadNoiseDataURI() {
  const noiseBuffer = await readFile(
    join(process.cwd(), 'src/assets/noise.png')
  )
  return `data:image/png;base64,${noiseBuffer.toString('base64')}`
}

export async function generateOGImage(title: string, type: PostType) {
  const [fonts, noiseDataURI] = await Promise.all([
    loadFonts(),
    loadNoiseDataURI(),
  ])

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px 96px',
        background: `linear-gradient(135deg, ${IRIS_2} 0%, ${IRIS_1} 100%)`,
        fontFamily: "'Geist Sans', 'Noto Sans JP', sans-serif",
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url("${noiseDataURI}")`,
          backgroundSize: `${WIDTH}px ${HEIGHT}px`,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1em',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            fontWeight: 400,
            color: IRIS_10,
          }}
        >
          osgsm.io / {TYPE_LABEL[type]}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 400,
            color: IRIS_11,
            lineHeight: 1.4,
            overflow: 'hidden',
            wordBreak: 'auto-phrase',
            textWrap: 'pretty',
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "'Geist Pixel Circle', sans-serif",
          color: IRIS_10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {TYPE_DESCRIPTION[type]}
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    }
  )
}
