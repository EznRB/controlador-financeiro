'use client'
import { useSession } from 'next-auth/react'

export default function PricingPage() {
  const { data: session } = useSession()
  const plan = (session?.user as any)?.plan || 'free'
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center">Escolha seu plano</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300 text-center">Teste grátis por 30 dias no plano mensal.</p>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Mensal</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">R$ 9,90/mês • 30 dias grátis</p>
            <ul className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
              <li>• Todas as funções do organizador</li>
              <li>• Metas, recorrências e importação CSV</li>
              <li>• Suporte por email</li>
            </ul>
            <form action="/api/stripe/checkout" method="POST" className="mt-6">
              <input type="hidden" name="plan" value="monthly" />
              {plan === 'monthly' ? (
                <button className="w-full rounded-lg bg-slate-400 px-6 py-3 text-white" disabled type="button">Assinatura ativa</button>
              ) : (
                <button className="w-full rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 transition-colors" type="submit">Começar teste grátis</button>
              )}
            </form>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Vitalício</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">R$ 29,90 uma vez • sem mensalidade</p>
            <ul className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
              <li>• Todas as funções do organizador</li>
              <li>• Acesso vitalício</li>
              <li>• Suporte por email</li>
            </ul>
            <form action="/api/stripe/checkout" method="POST" className="mt-6">
              <input type="hidden" name="plan" value="lifetime" />
              {plan === 'lifetime' ? (
                <button className="w-full rounded-lg bg-emerald-400 px-6 py-3 text-white" disabled type="button">Acesso vitalício ativo</button>
              ) : (
                <button className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors" type="submit">Comprar agora</button>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
