'use client'

import { useEffect, useState } from 'react'

export default function SetupProgress() {
  const [hasTransactions, setHasTransactions] = useState(false)
  const [hasGoals, setHasGoals] = useState(false)
  const [hasRecurring, setHasRecurring] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const t = await fetch('/api/transactions/list?limit=1').then((r) => r.json()).catch(() => ({}))
        setHasTransactions((t?.transactions || []).length > 0)
        const g = await fetch('/api/goals/list').then((r) => r.json()).catch(() => ({}))
        setHasGoals(((g?.goals || []).length ?? 0) > 0)
        const r = await fetch('/api/recurring/list').then((r) => r.json()).catch(() => ({}))
        setHasRecurring(((r?.items || []).length ?? 0) > 0)
      } catch {}
    }
    load()
  }, [])

  const steps = [
    { done: hasTransactions, label: 'Registrar 1ª transação' },
    { done: hasGoals, label: 'Criar 1 meta' },
    { done: hasRecurring, label: 'Configurar 1 despesa recorrente' },
  ]
  const completed = steps.filter((s) => s.done).length
  const pct = Math.round((completed / steps.length) * 100)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/60 dark:bg-slate-800/60">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Progresso inicial</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">{pct}% completo</div>
        </div>
        <div className="w-40 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-3 flex gap-2 flex-wrap">
        {steps.map((s, i) => (
          <span key={i} className={`text-xs px-2 py-1 rounded-full ${s.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>{s.done ? '✔' : '•'} {s.label}</span>
        ))}
      </div>
    </div>
  )
}
