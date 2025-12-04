"use client"
import { useEffect, useRef, useState } from "react"

export function useInViewOnce(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (!ref.current || seen) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      })
    }, options || { threshold: 0.2 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [seen, options])
  return { ref, seen }
}
