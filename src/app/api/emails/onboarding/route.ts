import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, templates } from '@/lib/email'

export async function POST() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Necessário login' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email } })
  await sendEmail(email, 'Bem-vindo ao Organizador Financeiro', templates.onboarding(user?.name || ''))
  return NextResponse.json({ ok: true })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
