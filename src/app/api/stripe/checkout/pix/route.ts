import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const priceLifetime = process.env.STRIPE_PRICE_LIFETIME
  if (!stripeSecret || !priceLifetime) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  const stripe = new Stripe(stripeSecret)
  const successUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login?checkout=success`
  const cancelUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?plan=lifetime`
  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [ { price: priceLifetime!, quantity: 1 } ],
      // Não forçar Pix: Stripe mostra métodos elegíveis dinamicamente
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return NextResponse.redirect(checkout.url!, { status: 303 })
  } catch (err: any) {
    const msg = err?.message || 'Pix indisponível nesta conta Stripe'
    // Retornar 400 para o frontend mostrar mensagem amigável
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
