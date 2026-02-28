'use client'

export function CodeSandbox({ id, module }: { id: string; module?: string }) {
  const defaultModule = '/src/App.tsx'
  return (
    <div className="brder-border -mx-1 overflow-clip rounded-3xl border">
      <iframe
        className="size-full h-120"
        src={`https://codesandbox.io/embed/${id}?view=preview&module=${module || defaultModule}&hidenavigation=1&hidedevtools=1`}
        title="CodeSandbox"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  )
}
