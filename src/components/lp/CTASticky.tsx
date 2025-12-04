"use client"
import { useEffect, useState } from 'react'

export default function CTASticky() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
      <div className="rounded-full shadow-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 px-5 py-3 flex items-center gap-3 backdrop-blur">
        <span className="text-sm text-slate-800 dark:text-slate-200">Pronto para clareza financeira?</span>
        <a href="/checkout?plan=monthly" className="rounded-full bg-slate-900 px-4 py-2 text-white shadow">Teste grátis</a>
        <a href="/checkout?plan=lifetime" className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow">Vitalício</a>
      </div>
    </div>
  )
}
