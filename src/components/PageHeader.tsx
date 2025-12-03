import React from 'react'

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-600 dark:text-slate-400 text-lg">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  )
}

