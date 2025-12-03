import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const priceMonthly = process.env.STRIPE_PRICE_MONTHLY
  if (!stripeSecret || !priceMonthly) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  const stripe = new Stripe(stripeSecret)
  const body = await req.json().catch(() => ({}))
  const paymentMethodId = body?.paymentMethodId as string | undefined
  const email = body?.email as string | undefined
  if (!paymentMethodId) return NextResponse.json({ error: 'paymentMethodId ausente' }, { status: 400 })
  try {
    const customer = await stripe.customers.create({ email })
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id })
    await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: paymentMethodId } })
    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceMonthly! }],
      trial_period_days: 30,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: { plan: 'monthly' },
    })
    return NextResponse.json({ subscriptionId: sub.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Falha ao criar assinatura' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
