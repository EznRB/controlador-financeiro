const faqs = [
  { q: 'O teste grátis cobra algo?', a: 'Não. 30 dias sem custo e só será cobrado se continuar.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Cancelamento imediato pelo Portal de Cobrança.' },
  { q: 'Qual a diferença do vitalício?', a: 'Pagamento único de R$ 29,90, sem mensalidade.' },
]

export default function FAQSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Perguntas frequentes</h2>
      <div className="mt-6 space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white/75 dark:bg-slate-900/60 backdrop-blur">
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{f.q}</div>
            <div className="mt-2 text-slate-700 dark:text-slate-200">{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
