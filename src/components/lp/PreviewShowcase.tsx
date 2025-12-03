"use client"
import { motion } from "framer-motion"
import CountUp from '@/components/CountUp'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'

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
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  return (
    <section id="preview" className="mx-auto max-w-6xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/70 dark:bg-slate-900/50 backdrop-blur">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="p-2 rounded-lg bg-teal-500/10">
              <Wallet className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Saldo Atual</div>
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">{fmt.format(2450)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Ganhos do Período</div>
              <div className="text-2xl font-bold text-emerald-600">{fmt.format(3120)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Despesas do Período</div>
              <div className="text-2xl font-bold text-red-600">{fmt.format(670)}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Sparkline />
        </div>
        <div className="mt-6 space-y-3">
          {tx.map((t, i) => (
            <div key={i} className="flex justify-between items-center rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/60 dark:bg-slate-900/40">
              <div className="text-slate-800 dark:text-slate-200">{t.d}</div>
              <div className={t.v > 0 ? 'text-emerald-600' : 'text-red-600'}>
                {t.v > 0 ? '+' : '-'}{fmt.format(Math.abs(t.v))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-slate-500">Recursos completos no teste grátis</div>
      </motion.div>
    </section>
  )
}
