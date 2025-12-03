"use client"
import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [variant, setVariant] = useState<'A'|'B'>('A')
  useEffect(() => {
    const cookie = document.cookie.match(/ab_variant=([AB])/)
    const v = cookie ? (cookie[1] as 'A'|'B') : (Math.random() < 0.5 ? 'A' : 'B')
    setVariant(v)
    if (!cookie) document.cookie = `ab_variant=${v};path=/;max-age=${60*60*24*30}`
  }, [])
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'O teste grátis cobra algo?',
              acceptedAnswer: { '@type': 'Answer', text: 'Não. Você usa 30 dias e só será cobrado se continuar.' }
            },
            {
              '@type': 'Question',
              name: 'Posso cancelar quando quiser?',
              acceptedAnswer: { '@type': 'Answer', text: 'Sim. Cancelamento imediato pelo portal de cobrança.' }
            },
            {
              '@type': 'Question',
              name: 'Qual a diferença do vitalício?',
              acceptedAnswer: { '@type': 'Answer', text: 'Pagamento único de R$ 29,90, sem mensalidade.' }
            }
          ]
        })}
      </Script>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
          {variant === 'A' ? 'Organize seu dinheiro com clareza e confiança' : 'Controle financeiro simples: veja, planeje e evolua'}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300">
          {variant === 'A' ? 'Controle total de entradas e saídas, metas, recorrências e investimentos — tudo em um só lugar.' : 'Em poucos minutos, tenha visão total e metas inteligentes para conquistar tranquilidade.'}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="/pricing"
            className="rounded-lg bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 transition-colors"
          >
            Experimentar grátis por 30 dias
          </a>
          <a
            href="/faq"
            className="rounded-lg border border-slate-300 px-6 py-3 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
          >
            Dúvidas?
          </a>
          <a
            href="/auth/login"
            className="rounded-lg border border-slate-300 px-6 py-3 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
          >
            Entrar
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Progresso guiado</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Checklist de configuração com barra de progresso para aquecer e engajar.</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Metas e recorrências</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Defina metas e automatize despesas para previsibilidade mensal.</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Importe seu extrato</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Importe CSV e tenha visão clara do seu histórico financeiro.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Comece agora sem risco</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">1 mês grátis. Depois, R$ 9,90/mês ou R$ 29,90 vitalício.</p>
          <a href="/pricing" className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors">Ver planos</a>
        </div>
      </section>
    </main>
  )
}
