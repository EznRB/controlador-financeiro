import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const priceLifetime = process.env.STRIPE_PRICE_LIFETIME
  if (!stripeSecret || !priceLifetime) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  const stripe = new Stripe(stripeSecret)
  try {
    const price = await stripe.prices.retrieve(priceLifetime)
    const amount = price.unit_amount
    const currency = price.currency
    if (!amount || !currency) throw new Error('Price inválido')
    const body = await req.json().catch(() => ({}))
    const receipt_email = body?.email || undefined
    const pi = await stripe.paymentIntents.create({
      amount,
      currency,
      description: 'Plano vitalício Organizador Financeiro',
      automatic_payment_methods: { enabled: true },
      receipt_email,
      metadata: { plan: 'lifetime' },
    })
    return NextResponse.json({ clientSecret: pi.client_secret })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Falha ao criar PaymentIntent' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
