export default function PricingBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 text-center">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-2xl font-bold">Comece sem risco</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">30 dias grátis no Mensal • R$ 9,90/mês • R$ 29,90 Vitalício</p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <a href="/checkout?plan=monthly" className="rounded-lg bg-slate-900 px-6 py-3 text-white">Experimentar grátis</a>
          <a href="/checkout?plan=lifetime" className="rounded-lg bg-emerald-600 px-6 py-3 text-white">Comprar Vitalício</a>
        </div>
        <div className="mt-3 text-slate-500">Cancelamento em 1 clique • Pagamento seguro via Stripe</div>
      </div>
    </section>
  )
}
