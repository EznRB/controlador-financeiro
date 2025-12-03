export default function TrustBar() {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center bg-white/70 dark:bg-slate-900/50">
          <div className="text-sm text-slate-600 dark:text-slate-200">Pagamento Seguro</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">Stripe • Cartão • Pix</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center bg-white/70 dark:bg-slate-900/50">
          <div className="text-sm text-slate-600 dark:text-slate-200">Privacidade</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">Dados criptografados</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center bg-white/70 dark:bg-slate-900/50">
          <div className="text-sm text-slate-600 dark:text-slate-200">Sem Risco</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">30 dias grátis</div>
        </div>
      </div>
    </section>
  )
}
