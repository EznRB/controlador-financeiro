"use client"
import { motion } from "framer-motion"
import { ShieldCheck, BadgeCheck } from "lucide-react"

export default function PricingBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 opacity-30 blur-xl" />
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative z-10 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 bg-white/85 dark:bg-slate-900/70 backdrop-blur text-center shadow-xl">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Comece sem risco</h2>
          <p className="mt-3 text-slate-700 dark:text-slate-200">30 dias grátis no Mensal • R$ 9,90/mês • R$ 29,90 Vitalício</p>
          <div className="mt-5 flex items-center justify-center gap-4">
            <a href="/checkout?plan=monthly" className="rounded-xl bg-slate-900 px-7 py-3 text-white shadow hover:bg-slate-700 transition-colors">Experimentar grátis</a>
            <a href="/checkout?plan=lifetime" className="rounded-xl bg-emerald-600 px-7 py-3 text-white shadow hover:bg-emerald-500 transition-colors">Comprar Vitalício</a>
          </div>
          <div className="mt-5 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><ShieldCheck className="h-4 w-4 text-emerald-600" />Pagamento seguro via Stripe</div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><BadgeCheck className="h-4 w-4 text-emerald-600" />Cancelamento em 1 clique</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
