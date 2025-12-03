export default function TrustBar() {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="text-sm text-slate-500">Pagamento Seguro</div>
          <div className="text-lg font-semibold">Stripe • Cartão • Pix</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="text-sm text-slate-500">Privacidade</div>
          <div className="text-lg font-semibold">Dados criptografados</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="text-sm text-slate-500">Sem Risco</div>
          <div className="text-lg font-semibold">30 dias grátis</div>
        </div>
      </div>
    </section>
  )
}
