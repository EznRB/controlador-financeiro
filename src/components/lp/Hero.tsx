"use client"
import { motion } from "framer-motion"
import { Player } from "@lottiefiles/react-lottie-player"
import { useInViewOnce } from "@/hooks/useInViewOnce"

export default function Hero() {
  const { ref, seen } = useInViewOnce()
  if (seen) { try { (window as any).plausible?.('lp_section_view', { props: { section: 'hero' } }) } catch {} }
  return (
    <section ref={ref} className="relative mx-auto max-w-6xl px-4 py-24 text-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/10 to-transparent" />
      <motion.h1 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
        Controle financeiro simples, bonito e eficiente
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300">
        Veja o preview, entenda como funciona e comece seu teste grátis por 30 dias. Sem risco, cancelamento em 1 clique.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-10 flex items-center justify-center gap-4">
        <a href="/checkout?plan=monthly" className="rounded-xl bg-slate-900 px-7 py-3 text-white shadow hover:bg-slate-700 transition-colors">Experimentar grátis 30 dias</a>
        <a href="#preview" className="rounded-xl border border-slate-300 px-7 py-3 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">Ver Preview</a>
        <a href="/checkout?plan=lifetime" className="rounded-xl bg-emerald-600 px-7 py-3 text-white shadow hover:bg-emerald-500 transition-colors">Comprar Vitalício</a>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} className="mx-auto mt-12 max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 backdrop-blur shadow-xl overflow-hidden">
        <Player autoplay loop src="https://assets5.lottiefiles.com/packages/lf20_jk6c1tlw.json" style={{ height: 240 }} />
      </motion.div>

      {null}
    </section>
  )
}
