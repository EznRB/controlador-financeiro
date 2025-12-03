import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeSecret || !webhookSecret) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  const stripe = new Stripe(stripeSecret)

  const sig = req.headers.get('stripe-signature')
  const buf = Buffer.from(await req.arrayBuffer())

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf, sig!, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Assinatura inválida: ${err.message}` }, { status: 400 })
  }

  try {
    const sess = (event.type === 'checkout.session.completed') ? (event.data.object as any) : null
    await prisma.paymentEvent.create({
      data: {
        type: event.type,
        data: event as any,
        utmSource: sess?.metadata?.utm_source || null,
        utmMedium: sess?.metadata?.utm_medium || null,
        utmCampaign: sess?.metadata?.utm_campaign || null,
        utmContent: sess?.metadata?.utm_content || null,
      },
    })
  } catch {}

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const email = session.customer_details?.email || undefined
        const customerId = typeof session.customer === 'string' ? session.customer : undefined
        const isSub = session.mode === 'subscription'
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : undefined
        const plan = session.metadata?.plan || (isSub ? 'monthly' : 'lifetime')
        const refCode = session.metadata?.ref || null
        if (email) {
          await prisma.user.upsert({
            where: { email },
            update: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              plan,
              subscriptionStatus: isSub ? 'active' : 'lifetime',
              lifetimePaidAt: isSub ? undefined : new Date(),
            },
            create: {
              email,
              name: 'Usuário',
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              plan,
              subscriptionStatus: isSub ? 'active' : 'lifetime',
              lifetimePaidAt: isSub ? undefined : new Date(),
            },
          })
          // referral: se houver ref code, criar evento e vincular referee depois
          if (refCode) {
            try {
              const referrer = await prisma.user.findFirst({ where: { referralCode: refCode } })
              if (referrer) {
                await prisma.referral.create({ data: { referrerId: referrer.id, email, status: 'converted' } })
              }
            } catch {}
          }
          // email de pagamento sucesso
          try { const { sendEmail, templates } = await import('@/lib/email'); await sendEmail(email, 'Pagamento confirmado', templates.paymentSuccess()) } catch {}
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status
        const customerId = typeof sub.customer === 'string' ? sub.customer : undefined
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            subscriptionStatus: status,
            plan: 'monthly',
            trialEndAt: trialEnd ?? undefined,
          },
        })
        // lembrete de trial quando faltarem 3 dias (simples: envia no update se trial_end for próximo)
        const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / 86400000) : null
        if (daysLeft !== null && daysLeft <= 3 && daysLeft > 0) {
          try {
            const u = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
            if (u?.email) { const { sendEmail, templates } = await import('@/lib/email'); await sendEmail(u.email, 'Seu teste está terminando', templates.trialReminder(daysLeft)) }
          } catch {}
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : undefined
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'canceled', plan: 'canceled' },
        })
        break
      }
      case 'invoice.payment_succeeded':
      case 'charge.succeeded':
        // já auditado acima; estados atualizados pelos eventos de subscription/checkout
        break
      default:
        break
    }
  } catch (err) {
    // swallow para evitar retries infinitos; eventos já armazenados
  }

  return NextResponse.json({ received: true })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
