import React, { useEffect, useRef, useState } from 'react'

export default function CountUp({ value, duration = 600, format }: { value: number; duration?: number; format?: (v: number) => string }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const from = display
    const to = value
    startRef.current = start
    const step = (now: number) => {
      const elapsed = now - startRef.current
      const p = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const current = from + (to - from) * eased
      setDisplay(current)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const text = format ? format(display) : String(Math.round(display))
  return <span>{text}</span>
}

