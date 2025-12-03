"use client"
import { motion } from "framer-motion"
import CountUp from '@/components/CountUp'
import { Wallet, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'

const tx = [
  { d: 'Compra Mercado', v: -120 },
  { d: 'Serviço do dia', v: 200 },
  { d: 'Cartão de Crédito', v: -250 },
]

const spark = [10, 18, 14, 22, 28, 21, 30, 26, 34, 40]

function Sparkline() {
  const w = 360, h = 90, pad = 6
  const max = Math.max(...spark), min = Math.min(...spark)
  const xStep = (w - pad * 2) / (spark.length - 1)
  const pts = spark.map((y, i) => {
    const x = pad + i * xStep
    const yy = pad + (h - pad * 2) * (1 - (y - min) / (max - min))
    return `${x},${yy}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="rounded-xl">
      <defs>
        <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export default function PreviewShowcase() {
  const fmt = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), [])
  const [steps, setSteps] = useState([
    { k: 'tx', label: 'Registrar 1ª transação', done: false },
    { k: 'goal', label: 'Criar 1 meta', done: false },
    { k: 'rec', label: 'Configurar 1 recorrência', done: false },
  ])
  const completed = steps.filter((s) => s.done).length
  const pct = Math.round((completed / steps.length) * 100)
  const toggle = (k: string) => {
    setSteps((prev) => prev.map((s) => s.k === k ? { ...s, done: !s.done } : s))
    try { (window as any).plausible?.('lp_preview_step', { props: { key: k } }) } catch {}
  }
  return (
    <section id="preview" className="mx-auto max-w-6xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-white/75 dark:bg-slate-900/60 backdrop-blur">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="p-2 rounded-lg bg-teal-500/10">
              <Wallet className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Saldo Atual</div>
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">{fmt.format(2450)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Ganhos do Período</div>
              <div className="text-2xl font-bold text-emerald-600">{fmt.format(3120)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Despesas do Período</div>
              <div className="text-2xl font-bold text-red-600">{fmt.format(670)}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Sparkline />
        </div>
        <div className="mt-6 space-y-3">
          {tx.map((t, i) => (
            <div key={i} className="flex justify-between items-center rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-white/70 dark:bg-slate-900/50">
              <div className="text-slate-900 dark:text-white">{t.d}</div>
              <div className={t.v > 0 ? 'text-emerald-600' : 'text-red-600'}>
                {t.v > 0 ? '+' : '-'}{fmt.format(Math.abs(t.v))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white/75 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700 dark:text-slate-200">Experiência rápida</div>
            <div className="w-40 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="mt-3 grid md:grid-cols-3 gap-2">
            {steps.map((s) => (
              <button key={s.k} onClick={() => toggle(s.k)} className={`flex items-center justify-between w-full rounded-lg border p-3 text-left ${s.done ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50'}`}>
                <span className={`${s.done ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>{s.label}</span>
                <CheckCircle2 className={`h-5 w-5 ${s.done ? 'text-emerald-600' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <a href="/checkout?plan=monthly" onClick={() => { try { (window as any).plausible?.('click_cta', { props: { plan: 'monthly', from: 'preview' } }) } catch {} }} className={`rounded-xl px-6 py-3 text-white transition-colors shadow ${completed >= 2 ? 'bg-slate-900 hover:bg-slate-700' : 'bg-slate-500 cursor-pointer'}`}>
              {completed >= 2 ? 'Começar teste grátis' : 'Complete 2 passos para iniciar o teste'}
            </a>
          </div>
          <div className="mt-2 text-center text-slate-600 dark:text-slate-300">Recursos completos no teste grátis</div>
        </div>
      </motion.div>
    </section>
  )
}
