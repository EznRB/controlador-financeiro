"use client"
import { useEffect, useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

function CheckoutForm({ plan }: { plan: 'monthly'|'lifetime' }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string|null>(null)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setMessage(null)
    if (plan === 'lifetime') {
      const resPI = await fetch('/api/stripe/create-payment-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const dataPI = await resPI.json()
      if (!resPI.ok) { setLoading(false); setMessage(dataPI?.error || 'Falha ao iniciar pagamento'); return }
      const { clientSecret } = dataPI
      const result = await stripe.confirmPayment({ elements, clientSecret, confirmParams: { return_url: `${window.location.origin}/auth/login?checkout=success` } })
      if (result.error) setMessage(result.error.message || 'Erro ao confirmar pagamento')
      setLoading(false)
    } else {
      const resSI = await fetch('/api/stripe/create-setup-intent', { method: 'POST' })
      const dataSI = await resSI.json()
      if (!resSI.ok) { setLoading(false); setMessage(dataSI?.error || 'Falha ao iniciar método'); return }
      const { clientSecret } = dataSI
      const result = await stripe.confirmSetup({ elements, clientSecret })
      if (result.error) {
        setMessage(result.error.message || 'Erro ao confirmar método')
        setLoading(false)
        return
      }
      const subRes = await fetch('/api/stripe/finish-subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethodId: result.setupIntent.payment_method, email }) })
      const subData = await subRes.json()
      if (!subRes.ok) {
        setMessage(subData?.error || 'Falha ao criar assinatura')
        setLoading(false)
        return
      }
      window.location.href = '/auth/login?checkout=success'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
      <div className="mb-4">
        <input type="email" className="w-full rounded-lg border border-slate-300 px-4 py-2 mb-3" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      <button disabled={loading || !stripe || !elements} className="w-full rounded-lg bg-slate-900 px-6 py-3 text-white disabled:bg-slate-500" type="submit">
        {plan === 'monthly' ? (loading ? 'Confirmando método...' : 'Começar teste grátis') : (loading ? 'Processando...' : 'Comprar Vitalício')}
      </button>
      {message && <div className="mt-3 text-red-600 text-sm">{message}</div>}
      <div className="mt-4 text-center text-slate-500">Pagamento seguro via Stripe. Pix opcional se habilitado.</div>
    </form>
  )
}

export default function CheckoutPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const plan = (params.get('plan') as 'monthly'|'lifetime') || 'monthly'
  const stripePromise = useMemo(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string), [])
  const [clientSecret, setClientSecret] = useState<string|undefined>(undefined)

  useEffect(() => {
    const init = async () => {
      try {
        try { (window as any).plausible?.('checkout_start', { props: { plan } }) } catch {}
        const url = plan === 'monthly' ? '/api/stripe/create-setup-intent' : '/api/stripe/create-payment-intent'
        const res = await fetch(url, { method: 'POST' })
        const data = await res.json()
        if (res.ok) setClientSecret(data.clientSecret)
      } catch {}
    }
    init()
  }, [plan])

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{plan === 'monthly' ? 'Plano Mensal • 30 dias grátis' : 'Plano Vitalício • R$ 29,90'}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Complete seu pagamento com segurança</p>
        </div>
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm plan={plan} />
          </Elements>
        )}
      </section>
    </main>
  )
}
