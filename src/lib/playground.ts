export type PlaygroundItem = {
  title: string
  description: string | null
  href: string
  thumbnail: string
}

export const playgroundItems: PlaygroundItem[] = [
  {
    title: 'Ripple Distortion Slider',
    description: null,
    href: '/playground/ripple-distortion',
    thumbnail: '/images/playground/index/ripple-distortion.avif',
  },
  {
    title: 'Pixel Dissolve Slider',
    description: null,
    href: '/playground/pixel-dissolve',
    thumbnail: '/images/playground/index/pixel-dissolve.avif',
  },
  {
    title: 'Curl Noise Flow Field',
    description: null,
    href: '/playground/flow-field',
    thumbnail: '/images/playground/index/flow-field.avif',
  },
  {
    title: 'GPGPU Particles',
    description: null,
    href: '/playground/particles',
    thumbnail: '/images/playground/index/particles.gif',
  },
  {
    title: 'Noise Gradient with TSL',
    description: null,
    href: '/playground/noise-gradient',
    thumbnail: '/images/playground/index/noise-gradient.avif',
  },
  {
    title: 'Perfectly Ordinary Cube',
    description: null,
    href: '/playground/cube',
    thumbnail: '/images/playground/index/cube.avif',
  },
]
