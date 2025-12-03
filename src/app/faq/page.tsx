export default function FAQPage() {
  const faqs = [
    { q: 'O teste grátis cobra algo?', a: 'Não. Você usa 30 dias sem custo e só será cobrado se continuar.' },
    { q: 'Posso cancelar quando quiser?', a: 'Sim. O cancelamento é imediato pelo Portal de Cobrança.' },
    { q: 'Qual a diferença do vitalício?', a: 'Pagamento único de R$ 29,90, sem mensalidade e sem renovação.' },
    { q: 'Há Pix como forma de pagamento?', a: 'Se habilitado na sua conta Stripe, Pix pode ser selecionado no Checkout.' },
    { q: 'Meus dados estão seguros?', a: 'Usamos autenticação, criptografia de transporte (HTTPS) e nunca armazenamos dados de cartão.' },
    { q: 'Posso importar meu extrato?', a: 'Sim. Suporte a CSV para visão histórica de transações.' },
    { q: 'Receberei emails?', a: 'Você controla emails de alerta e resumo semanal nas preferências. Sem spam.' },
  ]
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Perguntas Frequentes</h1>
        <div className="mt-8 space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{f.q}</div>
              <div className="mt-2 text-slate-600 dark:text-slate-300">{f.a}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
