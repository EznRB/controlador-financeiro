const items = [
  { q: 'É complexo?', a: 'Não. Em minutos você vê tudo e cria metas sem esforço.' },
  { q: 'Vai tomar tempo?', a: 'Pouco. Recorrências automatizam o dia a dia.' },
  { q: 'É caro?', a: 'R$ 9,90/mês com 30 dias grátis ou R$ 29,90 vitalício.' },
  { q: 'E a segurança?', a: 'Pagamentos via Stripe e dados protegidos.' },
]

export default function ObjectionsBreaker() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Quebrando objeções</h2>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white/70 dark:bg-slate-900/50">
            <div className="font-semibold text-slate-900 dark:text-white">{it.q}</div>
            <div className="text-slate-700 dark:text-slate-200">{it.a}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
