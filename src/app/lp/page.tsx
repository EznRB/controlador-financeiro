"use client"
import Motion from '@/components/Motion'
import { useEffect } from 'react'

export default function LPPage() {
  useEffect(() => { try { (window as any).plausible?.('view_lp') } catch {} }, [])
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <Motion>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
            Organize seu dinheiro com clareza
          </h1>
        </Motion>
        <Motion delay={100}>
          <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300">
            Veja um preview do sistema e comece seu teste grátis de 30 dias. Pagamento seguro via Stripe.
          </p>
        </Motion>
        <Motion delay={200}>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a href="/checkout?plan=monthly" onClick={() => { try { (window as any).plausible?.('click_cta', { props: { plan: 'monthly' } }) } catch {} }} className="rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 transition-colors">
              Experimentar grátis 30 dias
            </a>
            <a href="/checkout?plan=lifetime" onClick={() => { try { (window as any).plausible?.('click_cta', { props: { plan: 'lifetime' } }) } catch {} }} className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors">
              Comprar Vitalício (R$ 29,90)
            </a>
          </div>
        </Motion>
      </section>
      <section className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-6" id="preview">
        {[
          { t: 'Metas e recorrências', d: 'Automatize despesas e acompanhe metas.' },
          { t: 'Importe seu extrato', d: 'CSV para visão clara do histórico.' },
          { t: 'Investimentos', d: 'Holdings e transações com preços.' },
        ].map((c, i) => (
          <Motion key={i}>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white/80 dark:bg-slate-900/50 backdrop-blur">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{c.t}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{c.d}</p>
            </div>
          </Motion>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Motion>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-500">Saldo Atual</div>
                <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">R$ 2.450,00</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Ganhos do Período</div>
                <div className="text-2xl font-bold text-emerald-600">R$ 3.120,00</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Despesas do Período</div>
                <div className="text-2xl font-bold text-red-600">R$ 670,00</div>
              </div>
            </div>
            <div className="mt-4 h-20 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
            <div className="mt-4 space-y-2">
              {[
                { d: 'Compra Mercado', v: -120 },
                { d: 'Serviço do dia', v: 200 },
                { d: 'Cartão de Crédito', v: -250 },
              ].map((t, i) => (
                <div key={i} className="flex justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <div>{t.d}</div>
                  <div className={t.v > 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {t.v > 0 ? '+' : '-'}R$ {Math.abs(t.v).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-slate-500">Recursos completos no teste grátis</div>
          </div>
        </Motion>
      </section>
    </main>
  )
}
