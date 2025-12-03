import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  const stripe = new Stripe(stripeSecret)
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Necessário estar logado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user?.stripeCustomerId) return NextResponse.json({ error: 'Cliente Stripe não encontrado' }, { status: 400 })
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings`,
  })
  return NextResponse.redirect(portal.url, { status: 303 })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
