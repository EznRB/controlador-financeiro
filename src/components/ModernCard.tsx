import React from 'react'

export default function ModernCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  )
}

