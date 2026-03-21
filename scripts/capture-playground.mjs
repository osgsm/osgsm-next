import { chromium } from 'playwright'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const OUTPUT_DIR = path.resolve('public/playground')
const VIEWPORT = { width: 1280, height: 720 }
const WAIT_MS = 2000

// Parse CLI args
// Usage:
//   node scripts/capture-playground.mjs <slug>                  → PNG capture
//   node scripts/capture-playground.mjs <slug> --gif [duration]  → GIF capture (duration in ms, default 2000)
const args = process.argv.slice(2)
const slug = args.find((a) => !a.startsWith('--'))
const isGif = args.includes('--gif')
const gifDurationIdx = args.indexOf('--gif')
const gifDuration =
  gifDurationIdx !== -1 &&
  args[gifDurationIdx + 1] &&
  !args[gifDurationIdx + 1].startsWith('--')
    ? parseInt(args[gifDurationIdx + 1], 10)
    : 2000

if (!slug) {
  console.error(
    'Usage: node scripts/capture-playground.mjs <slug> [--gif [duration_ms]]'
  )
  console.error(
    '  e.g. node scripts/capture-playground.mjs particles --gif 3000'
  )
  process.exit(1)
}

const target = { slug, gif: isGif, duration: gifDuration, fps: 10 }

// CSS to inject: hide leva panel, back-to-playground button, and Next.js DevTools
const HIDE_UI_CSS = `
  /* Leva panel wrapper */
  .pointer-events-none.fixed.inset-0.z-\\[1000\\] {
    display: none !important;
  }
  /* Back to playground button */
  .absolute.top-0.left-0.z-10 {
    display: none !important;
  }
  /* Next.js DevTools */
  nextjs-portal {
    display: none !important;
  }
`

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Use system Chrome for WebGPU support
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--window-size=1280,720'],
  })

  const url = `${BASE_URL}/playground/${target.slug}`
  console.log(
    `\nCapturing: ${target.slug} (${url})${target.gif ? ` [GIF ${target.duration}ms]` : ' [PNG]'}`
  )

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  })

  const tab = await context.newPage()

  // Inject CSS to hide UI before page loads
  await tab.addStyleTag({ content: HIDE_UI_CSS })

  await tab.goto(url, { waitUntil: 'networkidle' })

  // Re-inject CSS after navigation (in case SSR replaces it)
  await tab.addStyleTag({ content: HIDE_UI_CSS })

  // Wait for WebGPU content to render
  await tab.waitForTimeout(WAIT_MS)

  if (target.gif) {
    const { duration, fps } = target
    const outGif = path.join(OUTPUT_DIR, `${target.slug}.gif`)

    console.log(`  Recording ${duration}ms at ${fps}fps...`)

    const tmpFramesDir = path.join(OUTPUT_DIR, `_frames_${target.slug}`)
    if (!existsSync(tmpFramesDir)) mkdirSync(tmpFramesDir, { recursive: true })

    const totalFrames = Math.ceil((duration / 1000) * fps)

    for (let i = 0; i < totalFrames; i++) {
      const start = Date.now()
      await tab.screenshot({
        path: path.join(
          tmpFramesDir,
          `frame_${String(i).padStart(4, '0')}.png`
        ),
      })
      const elapsed = Date.now() - start
      const delay = Math.max(0, 1000 / fps - elapsed)
      if (i < totalFrames - 1 && delay > 0) {
        await new Promise((r) => setTimeout(r, delay))
      }
    }

    // Convert frames to GIF with ffmpeg
    console.log(`  Converting to GIF...`)
    execSync(
      `ffmpeg -y -framerate ${fps} -i "${tmpFramesDir}/frame_%04d.png" -vf "fps=${fps},scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${outGif}"`,
      { stdio: 'inherit' }
    )

    // Clean up frames
    execSync(`rm -rf "${tmpFramesDir}"`)
    console.log(`  Saved: ${outGif}`)
  } else {
    const outPng = path.join(OUTPUT_DIR, `${target.slug}.png`)
    await tab.screenshot({ path: outPng })
    console.log(`  Saved: ${outPng}`)
  }

  await context.close()

  await browser.close()
  console.log('\nDone!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
