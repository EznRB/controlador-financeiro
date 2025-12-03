"use client"
import { motion } from "framer-motion"
import CountUp from '@/components/CountUp'

const tx = [
  { d: 'Compra Mercado', v: -120 },
  { d: 'Serviço do dia', v: 200 },
  { d: 'Cartão de Crédito', v: -250 },
]

export default function PreviewShowcase() {
  return (
    <section id="preview" className="mx-auto max-w-6xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-slate-500">Saldo Atual</div>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">R$ <CountUp value={2450} duration={800} /></div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Ganhos do Período</div>
            <div className="text-2xl font-bold text-emerald-600">R$ <CountUp value={3120} duration={800} /></div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Despesas do Período</div>
            <div className="text-2xl font-bold text-red-600">R$ <CountUp value={670} duration={800} /></div>
          </div>
        </div>
        <div className="mt-4 h-20 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
        <div className="mt-4 space-y-2">
          {tx.map((t, i) => (
            <div key={i} className="flex justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div>{t.d}</div>
              <div className={t.v > 0 ? 'text-emerald-600' : 'text-red-600'}>
                {t.v > 0 ? '+' : '-'}R$ {Math.abs(t.v).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center text-slate-500">Recursos completos no teste grátis</div>
      </motion.div>
    </section>
  )
}
