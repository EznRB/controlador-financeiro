"use client"
import { useEffect, useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import ModernCard from '@/components/ModernCard'

function CheckoutForm({ plan, clientSecret }: { plan: 'monthly'|'lifetime', clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string|null>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'qr'|'processing'|'success'|'error'>('idle')
  const [qrUrl, setQrUrl] = useState<string|undefined>(undefined)
  const [mpQR, setMpQR] = useState<{ id: string, base64?: string, code?: string }|null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCountdown, setQrCountdown] = useState<number>(600)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setMessage(null)
    const { error: submitError } = await elements.submit()
    if (submitError) { setMessage(submitError.message || 'Verifique os dados e tente novamente'); setLoading(false); return }
    if (plan === 'lifetime') {
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/auth/login?checkout=success`,
          payment_method_data: { billing_details: { email } },
        },
      })
      if (result.error) {
        setMessage(result.error.message || 'Erro ao confirmar pagamento')
        setStatus('error')
      } else {
        const s = result.paymentIntent?.status
        if (s === 'requires_action' || s === 'processing') { setStatus('qr'); setShowQRModal(true) }
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

  useEffect(() => {
    let timer: any
    const poll = async () => {
      if (!stripe || !clientSecret) return
      try {
        const piRes = await stripe.retrievePaymentIntent(clientSecret)
        const s = piRes.paymentIntent?.status
        if (s === 'succeeded') {
          setStatus('success')
          window.location.href = '/auth/login?checkout=success'
        }
        if (s === 'canceled' || s === 'requires_payment_method') {
          setStatus('error')
        }
      } catch {}
    }
    if (status === 'qr') {
      timer = setInterval(poll, 3000)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [status, stripe, clientSecret])

  useEffect(() => {
    let t: any
    if (status === 'qr') {
      t = setInterval(() => setQrCountdown((v) => (v > 0 ? v - 1 : 0)), 1000)
    }
    return () => { if (t) clearInterval(t) }
  }, [status])

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 shadow-xl">
      <div className="mb-5">
        <div className="flex items-center justify-center gap-3 text-slate-500 mb-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Visa</span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Mastercard</span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Pix</span>
        </div>
        <input type="email" inputMode="email" autoComplete="email" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 mb-4" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button disabled={loading || !stripe || !elements || !email} className="w-full rounded-lg bg-slate-900 px-6 py-3 text-white disabled:bg-slate-600 transition hover:opacity-90" type="submit">
          {plan === 'monthly' ? (loading ? 'Confirmando método...' : 'Confirmar e iniciar teste grátis') : (loading ? (status==='qr' ? 'Gerando QR Pix...' : 'Processando...') : 'Pagar com Cartão')}
        </button>
        {plan === 'lifetime' && (
          <button onClick={async (e) => {
            e.preventDefault()
            setMessage(null)
            setStatus('processing')
            try {
              const resHosted = await fetch('/api/stripe/checkout/pix', { method: 'POST' })
              if (resHosted.status === 303) {
                const url = resHosted.headers.get('Location') || ''
                if (url) { window.location.href = url; return }
              }
              const resDirect = await fetch('/api/stripe/pix/direct-intent', { method: 'POST' })
              const dataDirect = await resDirect.json().catch(() => ({}))
              if (resDirect.ok && (dataDirect?.qr?.svg || dataDirect?.qr?.png || dataDirect?.hostedInstructionsUrl)) {
                const url = dataDirect?.qr?.svg || dataDirect?.qr?.png || dataDirect?.hostedInstructionsUrl
                setQrUrl(url || undefined)
                setStatus('qr')
                setShowQRModal(true)
                return
              }
              const resMp = await fetch('/api/pix/mp/charge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
              const dataMp = await resMp.json().catch(() => ({}))
              if (!resMp.ok) { setMessage(dataMp?.error || 'Pix indisponível'); setStatus('error'); return }
              setMpQR({ id: String(dataMp.id), base64: dataMp.qr_code_base64 || undefined, code: dataMp.qr_code || undefined })
              setStatus('qr')
              setShowQRModal(true)
              let tries = 0
              const poll = async () => {
                try {
                  const sRes = await fetch(`/api/pix/mp/status?id=${dataMp.id}`)
                  const s = await sRes.json()
                  if (s?.status === 'approved') { setStatus('success'); window.location.href = '/auth/login?checkout=success'; return }
                  if (s?.status === 'expired' || s?.status === 'cancelled') { setMessage('Pix expirado ou cancelado'); setStatus('error'); setShowQRModal(false); return }
                } catch {}
                if (tries++ < 60) setTimeout(poll, 2000)
              }
              poll()
            } catch {
              setMessage('Falha ao gerar Pix')
              setStatus('error')
            }
          }} className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-white transition hover:opacity-90">Pagar via Pix</button>
        )}
      </div>
      {message && <div className="mt-3 text-red-600 text-sm">{message}</div>}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="text-center mb-3 text-slate-900 dark:text-white text-lg font-semibold">Escaneie o QR para pagar</div>
            <div className="text-center text-sm text-slate-600 dark:text-slate-300 mb-3">Expira em {Math.floor(qrCountdown/60)}:{String(qrCountdown%60).padStart(2,'0')}</div>
            <div className="flex items-center justify-center mb-3">
              {qrUrl ? (<img src={qrUrl} alt="QR Pix" className="max-h-64" />) : (mpQR?.base64 ? (<img src={`data:image/png;base64,${mpQR.base64}`} alt="QR Pix" className="max-h-64" />) : (<div className="h-64 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />))}
            </div>
            {mpQR?.code && (
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{mpQR.code}</div>
                <button onClick={() => { try { navigator.clipboard.writeText(mpQR.code!) } catch {} }} className="rounded px-3 py-2 bg-slate-900 text-white">Copiar código</button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowQRModal(false)} className="rounded-lg px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">Fechar</button>
              <button onClick={() => window.location.reload()} className="rounded-lg px-4 py-2 bg-emerald-600 text-white">Atualizar</button>
            </div>
          </div>
        </div>
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
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <ModernCard className="p-6 md:col-span-1">
            <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">Resumo</div>
            <div className="text-slate-600 dark:text-slate-300 text-sm mb-4">{plan === 'monthly' ? 'Plano Mensal' : 'Plano Vitalício'}</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">{plan === 'monthly' ? 'R$ 0 / 30 dias' : 'R$ 29,90'}</div>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• Acesso completo</li>
              <li>• Sem taxas ocultas</li>
              <li>• Suporte prioritário</li>
            </ul>
          </ModernCard>
          <div className="md:col-span-2">
            <div className="text-center mb-6">
              <h1 suppressHydrationWarning className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{plan === 'monthly' ? '30 dias grátis' : 'Pagamento único seguro'}</h1>
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
          </div>
        </div>
      </section>
    </main>
  )
}
