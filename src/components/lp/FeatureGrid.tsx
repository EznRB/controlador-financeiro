const items = [
  { t: 'Metas inteligentes', d: 'Defina objetivos e veja progresso com clareza.' },
  { t: 'Recorrências automáticas', d: 'Nunca esqueça despesas fixas.' },
  { t: 'Importação de extrato', d: 'CSV para visão completa do histórico.' },
  { t: 'Investimentos', d: 'Holdings e transações com preços atualizados.' },
  { t: 'Relatórios', d: 'Finanças resumidas em segundos.' },
  { t: 'PWA rápido', d: 'Funciona até com internet instável.' },
]

export default function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-6">
      {items.map((c, i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{c.t}</h3>
          <p className="mt-2 text-slate-700 dark:text-slate-200">{c.d}</p>
        </div>
      ))}
    </section>
  )
}
