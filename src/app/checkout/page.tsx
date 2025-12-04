"use client"
import { useEffect, useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

function CheckoutForm({ plan, clientSecret }: { plan: 'monthly'|'lifetime', clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string|null>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'qr'|'processing'|'success'|'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setMessage(null)
    const { error: submitError } = await elements.submit()
    if (submitError) { setMessage(submitError.message || 'Verifique os dados e tente novamente'); setLoading(false); return }
    if (plan === 'lifetime') {
      const result = await stripe.confirmPayment({ elements, clientSecret, confirmParams: { return_url: `${window.location.origin}/auth/login?checkout=success` } })
      if (result.error) {
        setMessage(result.error.message || 'Erro ao confirmar pagamento')
        setStatus('error')
      } else {
        const s = result.paymentIntent?.status
        if (s === 'requires_action' || s === 'processing') setStatus('qr')
        if (s === 'succeeded') { setStatus('success'); window.location.href = '/auth/login?checkout=success' }
      }
      setLoading(false)
    } else {
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
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 shadow-xl">
      <div className="mb-5">
        <div className="flex items-center justify-center gap-3 text-slate-500 mb-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Visa</span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Mastercard</span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Pix</span>
        </div>
        <input type="email" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 mb-4" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      <button disabled={loading || !stripe || !elements} className="w-full rounded-lg bg-slate-900 px-6 py-3 text-white disabled:bg-slate-600 transition hover:opacity-90" type="submit">
        {plan === 'monthly' ? (loading ? 'Confirmando método...' : 'Confirmar e iniciar teste grátis') : (loading ? (status==='qr' ? 'Gerando QR Pix...' : 'Processando...') : 'Confirmar compra')}
      </button>
      {plan === 'lifetime' && (
        <button onClick={async (e) => {
          e.preventDefault()
          try {
            const res = await fetch('/api/stripe/checkout/pix', { method: 'POST' })
            if (res.status === 303) {
              const url = res.headers.get('Location') || ''
              if (url) window.location.href = url
              return
            }
            const data = await res.json().catch(() => ({}))
            setMessage((data && (data.error || data.message)) || 'Pix indisponível nesta conta Stripe')
          } catch {
            setMessage('Falha ao iniciar Pix hospedado')
          }
        }} className="mt-3 w-full rounded-lg bg-emerald-600 px-6 py-3 text-white transition hover:opacity-90">Pagar via Pix (checkout seguro)</button>
      )}
      {message && <div className="mt-3 text-red-600 text-sm">{message}</div>}
      {status==='qr' && (
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 text-center">Escaneie o QR Code no componente acima e confirme no seu banco. Validaremos automaticamente.</div>
      )}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />Pagamento seguro via Stripe</div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />Suporte prioritário</div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />Acesso imediato após confirmação</div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />Sem taxas ocultas</div>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const plan: 'monthly'|'lifetime' = mounted ? ((new URLSearchParams(window.location.search).get('plan') as 'monthly'|'lifetime') || 'monthly') : 'monthly'
  const stripePromise = useMemo(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string), [])
  const [clientSecret, setClientSecret] = useState<string|undefined>(undefined)
  const appearance = useMemo(() => ({ theme: 'night', variables: { colorPrimary: '#0f172a', colorBackground: '#0b1220', colorText: '#e2e8f0' } }), [])

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
          <h1 suppressHydrationWarning className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{plan === 'monthly' ? 'Plano Mensal • 30 dias grátis' : 'Plano Vitalício • R$ 29,90'}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Complete seu pagamento com segurança</p>
        </div>
        {!clientSecret && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 animate-pulse h-64" />
        )}
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance, paymentMethodOrder: plan === 'lifetime' ? ['pix','card'] : ['card'] } as any}>
            <CheckoutForm plan={plan} clientSecret={clientSecret} />
          </Elements>
        )}
        {clientSecret && plan === 'lifetime' && (
          <div className="mt-4">
            <button onClick={() => { try { (document.querySelector('form') as HTMLFormElement)?.requestSubmit() } catch {} }} className="w-full rounded-lg bg-slate-900 px-6 py-3 text-white transition hover:opacity-90">Confirmar compra</button>
          </div>
        )}
      </section>
    </main>
  )
}
