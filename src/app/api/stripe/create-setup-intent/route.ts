import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  const stripe = new Stripe(stripeSecret)
  try {
    const setupIntent = await stripe.setupIntents.create({ usage: 'off_session' })
    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Falha ao criar SetupIntent' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
