import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  const stripe = new Stripe(stripeSecret)

  const contentType = req.headers.get('content-type') || ''
  let plan: string | null = null
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({}))
    plan = body.plan || null
  } else {
    const form = await req.formData().catch(() => null)
    plan = form ? (form.get('plan') as string | null) : null
  }
  if (!plan || !['monthly', 'lifetime'].includes(plan)) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const customerEmail = session?.user?.email || undefined
  const cookieHeader = req.headers.get('cookie') || ''
  const utm = Object.fromEntries(
    ['utm_source','utm_medium','utm_campaign','utm_content'].map((k) => {
      const m = cookieHeader.match(new RegExp(`${k}=([^;]+)`))
      return [k, m ? decodeURIComponent(m[1]) : '']
    })
  )

  const priceMonthly = process.env.STRIPE_PRICE_MONTHLY
  const priceLifetime = process.env.STRIPE_PRICE_LIFETIME
  const successUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?checkout=success`
  const cancelUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?checkout=cancel`

  try {
    const isMonthly = plan === 'monthly'
    const checkout = await stripe.checkout.sessions.create({
      mode: isMonthly ? 'subscription' : 'payment',
      line_items: [
        {
          price: isMonthly ? priceMonthly! : priceLifetime!,
          quantity: 1,
        },
      ],
      payment_method_types: process.env.STRIPE_ENABLE_PIX === 'true' ? ['card','pix'] as any : undefined,
      allow_promotion_codes: true,
      subscription_data: isMonthly ? { trial_period_days: 30 } : undefined,
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { plan, ...utm },
    })
    return NextResponse.redirect(checkout.url!, { status: 303 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Falha ao criar checkout' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
