interface MDXVideoProps {
  src: string
  caption?: string
  autoPlay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
}

export default function MDXVideo({
  caption,
  src,
  autoPlay = false,
  controls = true,
  loop = false,
  muted = true,
}: MDXVideoProps) {
  return (
    <div className="my-6 flex flex-col justify-end gap-2">
      <div className="relative -mx-1 w-fit overflow-hidden rounded-3xl border border-border">
        <video
          autoPlay={autoPlay}
          controls={controls}
          loop={loop}
          muted={muted}
          playsInline
          className="h-auto w-full object-contain"
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {caption && (
        <sub className="pt-0 pb-4 text-center text-gray-500">{caption}</sub>
      )}
    </div>
  )
}
