"use client"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
        Controle financeiro simples, bonito e eficiente
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300">
        Veja o preview, entenda como funciona e comece seu teste grátis por 30 dias. Sem risco, cancelamento em 1 clique.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-10 flex items-center justify-center gap-4">
        <a href="/checkout?plan=monthly" className="rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 transition-colors">Experimentar grátis 30 dias</a>
        <a href="#preview" className="rounded-lg border border-slate-300 px-6 py-3 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">Ver Preview</a>
        <a href="/checkout?plan=lifetime" className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors">Comprar Vitalício</a>
      </motion.div>
    </section>
  )
}
