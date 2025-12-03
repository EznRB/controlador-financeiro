import React, { useEffect, useRef, useState } from 'react'

export default function Motion({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const prefers = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(prefers.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    prefers.addEventListener('change', onChange)
    if (prefers.matches) {
      setVisible(true)
      return () => prefers.removeEventListener('change', onChange)
    }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          obs.disconnect()
        }
      })
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => {
      obs.disconnect()
      prefers.removeEventListener('change', onChange)
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={`${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${reduced ? '' : 'transition-all duration-500 ease-out'} ${className}`}
    >
      {children}
    </div>
  )
}
