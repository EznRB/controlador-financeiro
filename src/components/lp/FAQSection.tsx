"use client"
import { useState } from 'react'

const faqs = [
  { q: 'O teste grátis cobra algo?', a: 'Não. 30 dias sem custo e só será cobrado se continuar.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Cancelamento imediato pelo Portal de Cobrança.' },
  { q: 'Qual a diferença do vitalício?', a: 'Pagamento único de R$ 29,90, sem mensalidade.' },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Perguntas frequentes</h2>
      <div className="mt-6 space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/60 backdrop-blur">
            <button className="w-full text-left p-4 flex items-center justify-between" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">{f.q}</span>
              <span className="text-slate-600 dark:text-slate-300">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <div className="px-4 pb-4 text-slate-700 dark:text-slate-200">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
